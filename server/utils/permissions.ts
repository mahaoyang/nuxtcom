import { PrismaClient } from '@prisma/client'
import type { H3Event } from 'h3'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()

export async function canUser(event: H3Event, permissionCode: string): Promise<boolean> {
  try {
    const session = await getServerSession(event)

    if (!session?.user?.email) {
      return false
    }

    // SuperAdmin bypass
    if (session.user.isSuperAdmin) {
      return true
    }

    // Check if user has permission
    const hasPermission = session.user.permissions?.includes(permissionCode)
    return hasPermission || false
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

export async function requireAuth(event: H3Event) {
  const session = await getServerSession(event)

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  return session
}

export async function requirePermission(event: H3Event, permissionCode: string) {
  const session = await requireAuth(event)

  const allowed = await canUser(event, permissionCode)

  if (!allowed) {
    throw createError({
      statusCode: 403,
      message: `Forbidden - Missing permission: ${permissionCode}`
    })
  }

  return session
}

export async function getUserFromSession(event: H3Event) {
  const session = await getServerSession(event)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
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

  return user
}

export async function checkOwnership(
  event: H3Event,
  resourceType: 'post' | 'ranking' | 'comment',
  resourceId: string
): Promise<boolean> {
  try {
    const user = await getUserFromSession(event)
    if (!user) return false

    // SuperAdmin bypass
    if (user.role.isSuperAdmin) return true

    let resource: any
    switch (resourceType) {
      case 'post':
        resource = await prisma.blogPost.findUnique({ where: { id: resourceId } })
        break
      case 'ranking':
        resource = await prisma.ranking.findUnique({ where: { id: resourceId } })
        break
      case 'comment':
        resource = await prisma.comment.findUnique({ where: { id: resourceId } })
        break
    }

    return resource?.authorId === user.id
  } catch (error) {
    console.error('Ownership check error:', error)
    return false
  }
}
