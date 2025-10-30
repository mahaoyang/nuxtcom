import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth.secret,
  providers: [
    // @ts-expect-error
    GoogleProvider.default({
      clientId: useRuntimeConfig().google.clientId,
      clientSecret: useRuntimeConfig().google.clientSecret,
    }),
    // @ts-expect-error
    GithubProvider.default({
      clientId: useRuntimeConfig().github.clientId,
      clientSecret: useRuntimeConfig().github.clientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        // Find or create user in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { role: true }
        })

        if (existingUser) {
          // Update last active
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastActiveAt: new Date() }
          })
          return true
        }

        // Create new user with viewer role
        const viewerRole = await prisma.role.findUnique({
          where: { name: 'viewer' }
        })

        if (!viewerRole) {
          console.error('Viewer role not found!')
          return false
        }

        // Check if email is superadmin
        const superadminEmail = useRuntimeConfig().public.superadminEmail
        const isSuperAdmin = user.email === superadminEmail

        const roleToAssign = isSuperAdmin
          ? await prisma.role.findUnique({ where: { name: 'superadmin' } })
          : viewerRole

        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || 'Anonymous',
            avatar: user.image || null,
            provider: account?.provider === 'google' ? 'GOOGLE' : 'GITHUB',
            providerId: account?.providerAccountId || '',
            roleId: roleToAssign?.id || viewerRole.id,
            creditPoints: 0,
            trustScore: 0.0,
            status: 'ACTIVE'
          }
        })

        // Log daily login credit
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (dbUser) {
          await prisma.userCreditHistory.create({
            data: {
              userId: dbUser.id,
              action: 'DAILY_LOGIN',
              points: 1,
              reason: 'First login of the day'
            }
          })

          await prisma.user.update({
            where: { id: dbUser.id },
            data: { creditPoints: { increment: 1 } }
          })
        }

        return true
      } catch (error) {
        console.error('Error during sign in:', error)
        return false
      }
    },

    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        })

        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            role: dbUser.role.name,
            isSuperAdmin: dbUser.role.isSuperAdmin,
            creditPoints: dbUser.creditPoints,
            trustScore: dbUser.trustScore,
            status: dbUser.status,
            permissions: dbUser.role.rolePermissions.map(rp => rp.permission.code)
          }
        }
      }
      return session
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    }
  }
})
