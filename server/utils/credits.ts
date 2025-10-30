import { PrismaClient, CreditAction } from '@prisma/client'

const prisma = new PrismaClient()

interface CreditConfig {
  VIEW: number
  DAILY_LOGIN: number
  COMMENT: number
  COMMENT_UPVOTE: number
  POST: number
  POST_UPVOTE: number
  RANKING_UPVOTE: number
  SPAM_DETECTED: number
  CONTENT_FLAGGED: number
}

const CREDIT_POINTS: CreditConfig = {
  VIEW: 0.5,
  DAILY_LOGIN: 1,
  COMMENT: 2,
  COMMENT_UPVOTE: 1,
  POST: 10,
  POST_UPVOTE: 2,
  RANKING_UPVOTE: 1,
  SPAM_DETECTED: -10,
  CONTENT_FLAGGED: -20
}

export async function awardCredit(
  userId: string,
  action: CreditAction,
  reason: string,
  metadata?: any
) {
  const points = CREDIT_POINTS[action]

  // Create credit history
  await prisma.userCreditHistory.create({
    data: {
      userId,
      action,
      points,
      reason,
      metadata: metadata || null
    }
  })

  // Update user's total points
  await prisma.user.update({
    where: { id: userId },
    data: {
      creditPoints: { increment: points }
    }
  })

  // Check for auto-upgrade
  await checkAndUpgradeRole(userId)

  return points
}

async function checkAndUpgradeRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      creditHistory: {
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      behaviorLogs: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }
    }
  })

  if (!user) return

  // Don't downgrade admins/moderators
  if (['admin', 'moderator', 'superadmin'].includes(user.role.name)) {
    return
  }

  const points = user.creditPoints
  const accountAge = Date.now() - user.createdAt.getTime()
  const daysActive = accountAge / (1000 * 60 * 60 * 24)
  const anomalousCount = user.behaviorLogs.filter(log => log.isAnomalous).length
  const trustScore = user.trustScore

  // Viewer -> Commenter: 10 points + 7 days + no anomalies + trust >= 0.5
  if (user.role.name === 'viewer' && points >= 10 && daysActive >= 7 && anomalousCount === 0 && trustScore >= 0.5) {
    const commenterRole = await prisma.role.findUnique({ where: { name: 'commenter' } })
    if (commenterRole) {
      await prisma.user.update({
        where: { id: userId },
        data: { roleId: commenterRole.id }
      })
      console.log(`User ${userId} upgraded to commenter`)
    }
  }

  // Commenter -> Author: 50 points + 30 days + 10+ comments + trust >= 0.7
  const commentCount = await prisma.comment.count({ where: { authorId: userId } })
  if (user.role.name === 'commenter' && points >= 50 && daysActive >= 30 && commentCount >= 10 && trustScore >= 0.7) {
    const authorRole = await prisma.role.findUnique({ where: { name: 'author' } })
    if (authorRole) {
      await prisma.user.update({
        where: { id: userId },
        data: { roleId: authorRole.id }
      })
      console.log(`User ${userId} upgraded to author`)
    }
  }
}

export async function logBehavior(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  // Check for anomalous behavior
  const recentActions = await prisma.userBehaviorLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 60 * 1000) // Last minute
      }
    }
  })

  const isAnomalous = recentActions.length > 10 // More than 10 actions per minute

  await prisma.userBehaviorLog.create({
    data: {
      userId,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      isAnomalous,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null
    }
  })

  // If anomalous, penalize
  if (isAnomalous) {
    await awardCredit(userId, 'SPAM_DETECTED', 'Anomalous behavior detected')
  }

  // Update trust score
  await updateTrustScore(userId)
}

async function updateTrustScore(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      behaviorLogs: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }
    }
  })

  if (!user) return

  const totalLogs = user.behaviorLogs.length
  const anomalousLogs = user.behaviorLogs.filter(log => log.isAnomalous).length

  const baseScore = 1.0
  const anomalyPenalty = (anomalousLogs / Math.max(totalLogs, 1)) * 0.5
  const newTrustScore = Math.max(0, baseScore - anomalyPenalty)

  await prisma.user.update({
    where: { id: userId },
    data: { trustScore: newTrustScore }
  })
}
