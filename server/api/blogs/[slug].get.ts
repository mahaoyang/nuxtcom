import { PrismaClient } from '@prisma/client'
import { logBehavior, awardCredit } from '~/server/utils/credits'
import { getUserFromSession } from '~/server/utils/permissions'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug is required'
    })
  }

  const blog = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
          role: {
            select: {
              name: true
            }
          }
        }
      },
      categories: {
        include: {
          category: true
        }
      },
      _count: {
        select: {
          comments: true
        }
      }
    }
  })

  if (!blog) {
    throw createError({
      statusCode: 404,
      message: 'Blog post not found'
    })
  }

  // Increment view count
  await prisma.blogPost.update({
    where: { id: blog.id },
    data: { viewCount: { increment: 1 } }
  })

  // Award view credit to logged-in users (with rate limit)
  const user = await getUserFromSession(event)
  if (user) {
    const ipAddress = getRequestHeader(event, 'x-forwarded-for') || 'unknown'
    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

    // Log behavior
    await logBehavior(user.id, 'VIEW_BLOG', 'BLOG_POST', blog.id, ipAddress, userAgent)

    // Check if user viewed in last hour
    const recentView = await prisma.userCreditHistory.findFirst({
      where: {
        userId: user.id,
        action: 'VIEW',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      }
    })

    if (!recentView) {
      await awardCredit(user.id, 'VIEW', `Viewed blog: ${blog.title}`)
    }
  }

  return blog
})
