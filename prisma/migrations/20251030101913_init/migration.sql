-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "creditPoints" INTEGER NOT NULL DEFAULT 0,
    "trustScore" REAL NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    PRIMARY KEY ("roleId", "permissionId"),
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCreditHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCreditHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBehaviorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "isAnomalous" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBehaviorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "blogPostId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    PRIMARY KEY ("blogPostId", "categoryId"),
    CONSTRAINT "BlogCategory_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "url" TEXT,
    "logoImage" TEXT,
    "coverImage" TEXT,
    "rankingTypeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0.0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ranking_rankingTypeId_fkey" FOREIGN KEY ("rankingTypeId") REFERENCES "RankingType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ranking_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingCategory" (
    "rankingId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    PRIMARY KEY ("rankingId", "categoryId"),
    CONSTRAINT "RankingCategory_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rankingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankingVote_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Ranking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_creditPoints_idx" ON "User"("creditPoints");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "UserCreditHistory_userId_idx" ON "UserCreditHistory"("userId");

-- CreateIndex
CREATE INDEX "UserCreditHistory_createdAt_idx" ON "UserCreditHistory"("createdAt");

-- CreateIndex
CREATE INDEX "UserBehaviorLog_userId_idx" ON "UserBehaviorLog"("userId");

-- CreateIndex
CREATE INDEX "UserBehaviorLog_createdAt_idx" ON "UserBehaviorLog"("createdAt");

-- CreateIndex
CREATE INDEX "UserBehaviorLog_isAnomalous_idx" ON "UserBehaviorLog"("isAnomalous");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RankingType_name_key" ON "RankingType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RankingType_slug_key" ON "RankingType"("slug");

-- CreateIndex
CREATE INDEX "RankingType_slug_idx" ON "RankingType"("slug");

-- CreateIndex
CREATE INDEX "RankingType_displayOrder_idx" ON "RankingType"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_slug_key" ON "Ranking"("slug");

-- CreateIndex
CREATE INDEX "Ranking_slug_idx" ON "Ranking"("slug");

-- CreateIndex
CREATE INDEX "Ranking_rankingTypeId_idx" ON "Ranking"("rankingTypeId");

-- CreateIndex
CREATE INDEX "Ranking_authorId_idx" ON "Ranking"("authorId");

-- CreateIndex
CREATE INDEX "Ranking_status_idx" ON "Ranking"("status");

-- CreateIndex
CREATE INDEX "Ranking_score_idx" ON "Ranking"("score");

-- CreateIndex
CREATE INDEX "RankingVote_rankingId_idx" ON "RankingVote"("rankingId");

-- CreateIndex
CREATE INDEX "RankingVote_userId_idx" ON "RankingVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingVote_rankingId_userId_key" ON "RankingVote"("rankingId", "userId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_entityType_entityId_idx" ON "Comment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Comment_status_idx" ON "Comment"("status");

-- CreateIndex
CREATE INDEX "CommentVote_commentId_idx" ON "CommentVote"("commentId");

-- CreateIndex
CREATE INDEX "CommentVote_userId_idx" ON "CommentVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_commentId_userId_key" ON "CommentVote"("commentId", "userId");
