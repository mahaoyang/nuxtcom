# Vibe Code 博客系统 - 项目实施计划

## 已完成 ✅
1. Tailwind CSS 和 shadcn-vue 安装配置
2. 数据库 Schema 设计 (Prisma)
3. 项目基础结构

## 核心功能模块

### Phase 1: 基础架构 (必需)
- [ ] 数据库迁移和种子数据
- [ ] Google & GitHub OAuth 认证
- [ ] 用户权限系统 (Role + Permission Matrix)
- [ ] 积分系统基础逻辑
- [ ] API 路由结构

### Phase 2: 首页和排序系统
- [ ] 落地页设计
- [ ] Tab 切换 (CLI Tools, Coding Models, Third-party Proxies)
- [ ] 排序列表页 (瀑布流布局)
- [ ] 排序详情页
- [ ] 投票功能

### Phase 3: 博客系统
- [ ] 博客列表页 (瀑布流布局)
- [ ] 博客详情页
- [ ] 博客编辑器 (Markdown 或富文本)
- [ ] 分类系统 (多对多)

### Phase 4: 评论系统
- [ ] 多级评论 UI 组件
- [ ] 评论 API
- [ ] 评论投票
- [ ] 评论管理

### Phase 5: 积分和权限升级
- [ ] 自动风控系统
- [ ] 行为追踪
- [ ] 自动权限升级逻辑
- [ ] 用户仪表板

### Phase 6: 管理后台
- [ ] 内容审核
- [ ] 用户管理
- [ ] SuperAdmin 面板

## 技术栈总结
- **前端**: Nuxt 4 + Vue 3 + Tailwind CSS + shadcn-vue
- **认证**: @sidebase/nuxt-auth (Google + GitHub OAuth)
- **数据库**: PostgreSQL + Prisma ORM
- **部署**: 待定

## 当前状态
✅ 数据库 Schema 已完成
✅ Prisma 已配置
⏳ 需要创建 .env 文件配置数据库连接
⏳ 需要运行数据库迁移

## 下一步建议
1. 设置环境变量 (.env)
2. 运行 Prisma 迁移创建数据库表
3. 创建种子数据 (初始角色和权限)
4. 设置 OAuth 认证
5. 开始实现首页或博客列表页

## 预估工作量
这是一个完整的全栈项目,预计需要:
- 核心功能: 40-60 小时
- 完整实现: 80-120 小时
