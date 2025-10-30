import { PrismaClient } from '@prisma/client'
import { requirePermission, getUserFromSession } from '~/server/utils/permissions'
import { awardCredit, logBehavior } from '~/server/utils/credits'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'create_post')

  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const { title, content, excerpt, coverImage, categoryIds } = body

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      message: 'Title and content are required'
    })
  }

  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(7)

  // Create blog post
  const blog = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      authorId: user.id,
      status: 'DRAFT',
      categories: {
        create: (categoryIds || []).map((catId: string) => ({
          categoryId: catId
        }))
      }
    },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })

  // Award credit
  await awardCredit(user.id, 'POST', `Created blog post: ${title}`)

  // Log behavior
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') || 'unknown'
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'
  await logBehavior(user.id, 'CREATE_BLOG', 'BLOG_POST', blog.id, ipAddress, userAgent)

  return blog
})
