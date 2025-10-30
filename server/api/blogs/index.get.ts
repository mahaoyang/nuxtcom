import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const category = query.category as string
  const skip = (page - 1) * limit

  const where: any = {
    status: 'PUBLISHED'
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          slug: category
        }
      }
    }
  }

  const [blogs, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
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
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.blogPost.count({ where })
  ])

  return {
    blogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
