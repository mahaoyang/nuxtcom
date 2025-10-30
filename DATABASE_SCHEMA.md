# Database Schema Design

## Core Tables

### Users
- id (UUID, PK)
- email (String, Unique)
- name (String)
- avatar (String, nullable)
- provider (Enum: GOOGLE, GITHUB)
- providerId (String)
- roleId (UUID, FK -> Role)
- creditPoints (Int, default: 0)
- trustScore (Float, default: 0.0)
- status (Enum: ACTIVE, SUSPENDED, BANNED)
- lastActiveAt (DateTime)
- createdAt (DateTime)
- updatedAt (DateTime)

### Roles
- id (UUID, PK)
- name (String, Unique) // viewer, commenter, author, moderator, admin
- description (String)
- isSuperAdmin (Boolean, default: false)
- createdAt (DateTime)
- updatedAt (DateTime)

### Permissions
- id (UUID, PK)
- code (String, Unique) // view_content, create_comment, create_post, moderate, etc.
- name (String)
- description (String)
- category (String) // content, moderation, administration

### RolePermissions (Many-to-Many)
- roleId (UUID, FK -> Role)
- permissionId (UUID, FK -> Permission)
- @@unique([roleId, permissionId])

### UserCreditHistory
- id (UUID, PK)
- userId (UUID, FK -> User)
- action (Enum: VIEW, COMMENT, POST, UPVOTE, REPORT, etc.)
- points (Int)
- reason (String)
- metadata (JSON, nullable)
- createdAt (DateTime)

### UserBehaviorLog
- id (UUID, PK)
- userId (UUID, FK -> User)
- action (String)
- entityType (String, nullable) // blog, comment, ranking
- entityId (String, nullable)
- isAnomalous (Boolean, default: false)
- ipAddress (String, nullable)
- userAgent (String, nullable)
- createdAt (DateTime)

### Categories
- id (UUID, PK)
- name (String, Unique)
- slug (String, Unique)
- description (String, nullable)
- color (String, nullable)
- icon (String, nullable)
- createdAt (DateTime)
- updatedAt (DateTime)

### BlogPosts
- id (UUID, PK)
- title (String)
- slug (String, Unique)
- content (Text)
- excerpt (String, nullable)
- coverImage (String, nullable)
- authorId (UUID, FK -> User)
- status (Enum: DRAFT, PUBLISHED, ARCHIVED)
- viewCount (Int, default: 0)
- publishedAt (DateTime, nullable)
- createdAt (DateTime)
- updatedAt (DateTime)

### BlogCategories (Many-to-Many)
- blogPostId (UUID, FK -> BlogPost)
- categoryId (UUID, FK -> Category)
- @@unique([blogPostId, categoryId])

### RankingTypes
- id (UUID, PK)
- name (String, Unique) // CLI Tools, Coding Models, Third-party Proxies
- slug (String, Unique)
- description (String, nullable)
- icon (String, nullable)
- displayOrder (Int, default: 0)
- createdAt (DateTime)
- updatedAt (DateTime)

### Rankings
- id (UUID, PK)
- title (String)
- slug (String, Unique)
- description (Text)
- content (Text, nullable)
- url (String, nullable)
- logoImage (String, nullable)
- coverImage (String, nullable)
- rankingTypeId (UUID, FK -> RankingType)
- authorId (UUID, FK -> User)
- score (Float, default: 0.0)
- viewCount (Int, default: 0)
- upvoteCount (Int, default: 0)
- status (Enum: DRAFT, PUBLISHED, ARCHIVED)
- metadata (JSON, nullable) // for custom fields per type
- publishedAt (DateTime, nullable)
- createdAt (DateTime)
- updatedAt (DateTime)

### RankingCategories (Many-to-Many)
- rankingId (UUID, FK -> Ranking)
- categoryId (UUID, FK -> Category)
- @@unique([rankingId, categoryId])

### Comments
- id (UUID, PK)
- content (Text)
- authorId (UUID, FK -> User)
- parentId (UUID, FK -> Comment, nullable) // for nested comments
- entityType (Enum: BLOG_POST, RANKING)
- entityId (UUID) // ID of BlogPost or Ranking
- status (Enum: ACTIVE, FLAGGED, HIDDEN, DELETED)
- upvoteCount (Int, default: 0)
- createdAt (DateTime)
- updatedAt (DateTime)

### CommentVotes
- id (UUID, PK)
- commentId (UUID, FK -> Comment)
- userId (UUID, FK -> User)
- voteType (Enum: UPVOTE, DOWNVOTE)
- createdAt (DateTime)
- @@unique([commentId, userId])

### RankingVotes
- id (UUID, PK)
- rankingId (UUID, FK -> Ranking)
- userId (UUID, FK -> User)
- voteType (Enum: UPVOTE, DOWNVOTE)
- createdAt (DateTime)
- @@unique([rankingId, userId])

## Permission Matrix Design

### Initial Roles:
1. **viewer** (0-10 points)
   - view_content

2. **commenter** (10-50 points)
   - view_content
   - create_comment
   - upvote_comment

3. **author** (50-200 points)
   - view_content
   - create_comment
   - upvote_comment
   - create_post
   - edit_own_post
   - upvote_ranking

4. **moderator** (200+ points, manually assigned)
   - All author permissions
   - moderate_content
   - hide_comment
   - flag_user

5. **admin** (manually assigned)
   - All permissions

6. **superadmin** (code-level override)
   - All permissions + system configuration

## Credit Point System Rules

### Earning Points:
- View content (max 1/hour): +0.5 points
- Daily login: +1 point
- Create comment: +2 points
- Receive comment upvote: +1 point
- Create blog post: +10 points
- Create ranking entry: +5 points
- Receive post upvote: +2 points

### Losing Points:
- Comment flagged and confirmed: -5 points
- Post flagged and confirmed: -20 points
- Spam detected: -10 points
- Multiple anomalous behaviors: -15 points

### Auto-upgrade Conditions:
- viewer -> commenter: 10 points + 7 days activity + no anomalies
- commenter -> author: 50 points + 30 days activity + 10+ normal comments
- Trust score >= 0.7 required for each upgrade

### Anomaly Detection:
- More than 10 actions in 1 minute
- Repetitive identical comments
- Rapid voting patterns
- Suspicious IP changes
