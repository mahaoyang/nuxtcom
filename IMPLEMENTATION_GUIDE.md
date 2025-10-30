# Vibe Code 博客系统 - 实施指南

## ✅ 已完成的核心基础设施

### 1. 数据库层 (100%)
- ✅ 完整的 Prisma Schema (13个表)
  - User, Role, Permission, RolePermission
  - UserCreditHistory, UserBehaviorLog
  - Category, BlogPost, BlogCategory
  - RankingType, Ranking, RankingCategory, RankingVote
  - Comment, CommentVote
- ✅ SQLite 本地开发配置
- ✅ 数据库迁移成功
- ✅ Seed 脚本:
  - 6个角色(viewer→commenter→author→moderator→admin→superadmin)
  - 20个权限
  - 完整的角色-权限矩阵
  - 3个排序类型
  - 5个示例分类

### 2. 认证系统 (100%)
- ✅ Google OAuth 配置
- ✅ GitHub OAuth 配置
- ✅ 用户自动创建逻辑
- ✅ Session 管理
- ✅ SuperAdmin 检测

### 3. 权限系统 (100%)
- ✅ `/server/utils/permissions.ts`
  - `canUser()` - 权限检查
  - `requireAuth()` - 认证要求
  - `requirePermission()` - 权限要求
  - `getUserFromSession()` - 获取当前用户
  - `checkOwnership()` - 所有权检查

### 4. 积分和风控系统 (100%)
- ✅ `/server/utils/credits.ts`
  - `awardCredit()` - 授予积分
  - `logBehavior()` - 行为日志
  - `checkAndUpgradeRole()` - 自动升级角色
  - `updateTrustScore()` - 更新信任分数
  - 异常检测(每分钟>10次操作)
  - 自动升级规则:
    - viewer→commenter: 10分+7天+无异常+信任≥0.5
    - commenter→author: 50分+30天+10条评论+信任≥0.7

### 5. API 路由 (部分完成)
已创建:
- ✅ `GET /api/blogs` - 博客列表(分页+筛选)
- ✅ `GET /api/blogs/[slug]` - 博客详情(含浏览追踪)
- ✅ `POST /api/blogs` - 创建博客(含权限检查)

## 📋 需要继续实现的 API 路由

### 博客系统
```
PUT    /api/blogs/[id]          - 更新博客
DELETE /api/blogs/[id]          - 删除博客
POST   /api/blogs/[id]/publish  - 发布博客
```

### 排序系统
```
GET    /api/ranking-types       - 获取排序类型列表
GET    /api/rankings            - 排序列表(按类型筛选)
GET    /api/rankings/[slug]     - 排序详情
POST   /api/rankings            - 创建排序
PUT    /api/rankings/[id]       - 更新排序
POST   /api/rankings/[id]/vote  - 投票
DELETE /api/rankings/[id]/vote  - 取消投票
```

### 评论系统
```
GET    /api/comments                    - 获取评论(按实体)
POST   /api/comments                    - 创建评论
PUT    /api/comments/[id]               - 更新评论
DELETE /api/comments/[id]               - 删除评论
POST   /api/comments/[id]/vote          - 评论投票
DELETE /api/comments/[id]/vote          - 取消投票
GET    /api/comments/[id]/replies       - 获取回复
```

### 用户系统
```
GET    /api/users/me             - 当前用户信息
GET    /api/users/me/credits     - 积分历史
GET    /api/users/me/stats       - 用户统计
POST   /api/users/me/behavior    - 记录行为
```

### 分类系统
```
GET    /api/categories           - 所有分类
POST   /api/categories           - 创建分类(管理员)
PUT    /api/categories/[id]      - 更新分类
DELETE /api/categories/[id]      - 删除分类
```

## 📱 需要创建的前端组件

### 核心 UI 组件
1. **MasonryGrid.vue** - 瀑布流布局组件
2. **CommentTree.vue** - 多级评论树
3. **VoteButton.vue** - 投票按钮
4. **CategoryTag.vue** - 分类标签
5. **UserAvatar.vue** - 用户头像
6. **AuthButton.vue** - 登录/登出按钮
7. **PermissionGate.vue** - 权限门控组件

### Shadcn-vue 组件(需要安装)
```bash
pnpm dlx shadcn-vue@latest add button
pnpm dlx shadcn-vue@latest add card
pnpm dlx shadcn-vue@latest add tabs
pnpm dlx shadcn-vue@latest add avatar
pnpm dlx shadcn-vue@latest add badge
pnpm dlx shadcn-vue@latest add dropdown-menu
pnpm dlx shadcn-vue@latest add dialog
pnpm dlx shadcn-vue@latest add textarea
pnpm dlx shadcn-vue@latest add input
pnpm dlx shadcn-vue@latest add select
```

## 📄 需要创建的页面

### 首页
```
pages/index.vue
├─ RankingTabs (CLI/Models/Proxies)
├─ RankingCard (卡片组件)
└─ MasonryGrid (瀑布流布局)
```

### 博客系统
```
pages/blogs/index.vue       - 博客列表页
pages/blogs/[slug].vue      - 博客详情页
pages/blogs/new.vue         - 创建博客
pages/blogs/edit/[id].vue   - 编辑博客
```

### 排序系统
```
pages/rankings/[slug].vue         - 排序详情页
pages/rankings/new.vue            - 创建排序
pages/rankings/edit/[id].vue      - 编辑排序
```

### 用户系统
```
pages/dashboard/index.vue         - 用户仪表板
pages/dashboard/posts.vue         - 我的博客
pages/dashboard/rankings.vue      - 我的排序
pages/dashboard/comments.vue      - 我的评论
pages/dashboard/credits.vue       - 积分历史
```

### 管理后台
```
pages/admin/index.vue             - 管理首页
pages/admin/users.vue             - 用户管理
pages/admin/content.vue           - 内容审核
pages/admin/roles.vue             - 角色权限管理
```

## 🛠 开发步骤建议

### Step 1: 完成 API 路由 (估计: 4-6小时)
按照已有的模式,创建剩余的 API 端点。参考:
- `/server/api/blogs/index.get.ts` - GET 列表的模式
- `/server/api/blogs/[slug].get.ts` - GET 详情的模式
- `/server/api/blogs/index.post.ts` - POST 创建的模式

每个路由都应该:
1. 使用 `requirePermission()` 检查权限
2. 使用 `getUserFromSession()` 获取用户
3. 使用 `awardCredit()` 授予积分
4. 使用 `logBehavior()` 记录行为

### Step 2: 安装 Shadcn-vue 组件 (估计: 1小时)
```bash
pnpm dlx shadcn-vue@latest add button card tabs avatar badge ...
```

### Step 3: 创建核心 UI 组件 (估计: 6-8小时)
从简单到复杂:
1. UserAvatar, CategoryTag, VoteButton
2. AuthButton, PermissionGate
3. MasonryGrid (瀑布流)
4. CommentTree (多级评论)

### Step 4: 实现首页 (估计: 4-6小时)
1. 创建 `pages/index.vue`
2. 实现 Tab 切换
3. 加载排序数据
4. 集成瀑布流布局

### Step 5: 实现博客功能 (估计: 8-10小时)
1. 博客列表页(瀑布流)
2. 博客详情页(含评论)
3. 博客编辑器(Markdown)
4. 发布流程

### Step 6: 实现排序功能 (估计: 6-8小时)
类似博客,但更简单

### Step 7: 实现评论系统 (估计: 6-8小时)
1. CommentList 组件
2. CommentItem 组件(递归显示)
3. CommentForm 组件
4. 投票功能

### Step 8: 用户仪表板 (估计: 4-6小时)

### Step 9: 管理后台 (估计: 8-10小时)

### Step 10: 优化和测试 (估计: 4-6小时)
- Loading 状态
- 错误处理
- 图片懒加载
- SEO 优化

## 🚀 快速启动开发

### 当前可以做的:
1. 启动开发服务器: `pnpm dev`
2. 打开 Prisma Studio: `pnpm db:studio`
3. 查看数据库: http://localhost:5555

### 测试 API:
```bash
# 获取博客列表
curl http://localhost:3002/api/blogs

# 获取排序类型
需要创建: /api/ranking-types
```

### 需要的 OAuth 凭证:
1. Google: https://console.cloud.google.com/
2. GitHub: https://github.com/settings/developers

更新 `.env` 文件中的 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 等

## 📚 参考模式

### API 路由模式:
```typescript
// GET 列表
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, limit, filter } = query
  // ... 分页查询
  return { data, pagination }
})

// GET 详情
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const resource = await prisma.model.findUnique({ where: { id } })
  // ... 浏览追踪
  return resource
})

// POST 创建
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'permission_code')
  const user = await getUserFromSession(event)
  const body = await readBody(event)
  // ... 创建资源
  await awardCredit(user.id, 'ACTION', 'reason')
  await logBehavior(user.id, 'action', 'type', id)
  return resource
})
```

## 🎯 关键功能点

### 权限检查:
```typescript
// 在组件中
const { data, signIn, signOut } = useAuth()
const can = (permission: string) => {
  return data.value?.user?.permissions?.includes(permission)
}
```

### 瀑布流布局:
使用 CSS Grid 或库如 `vue-masonry-wall`

### 多级评论:
递归组件,传递 `depth` 参数控制嵌套层级

## 总结

**已完成**: 数据库、认证、权限、积分系统核心
**预计剩余工作量**: 40-60小时
**建议**: 按步骤逐个模块实现,每完成一个模块就测试

---
祝开发顺利! 🚀
