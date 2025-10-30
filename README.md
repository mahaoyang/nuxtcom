# Vibe Code 博客系统

一个功能完整的博客和排序平台,支持 Google/GitHub 登录、权限管理、积分系统和自动风控。

## 🎯 核心功能

- **认证系统**: Google & GitHub OAuth 登录
- **博客系统**: 多对多分类、瀑布流布局
- **排序系统**: CLI 工具、编程模型、第三方代理三大类排序
- **评论系统**: 多级嵌套评论、投票功能
- **权限系统**: 6级角色权限矩阵 (viewer → superadmin)
- **积分系统**: 自动风控、行为追踪、自动权限升级
- **管理后台**: 内容审核、用户管理

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
编辑 `.env` 文件,配置 Google/GitHub OAuth 凭证

### 3. 初始化数据库
```bash
pnpm prisma migrate dev
pnpm prisma:seed
```

### 4. 启动开发服务器
```bash
pnpm dev
```
访问 http://localhost:3002

### 5. 查看数据库
```bash
pnpm db:studio
```
访问 http://localhost:5555

## 📚 文档

- **DATABASE_SCHEMA.md** - 数据库设计
- **PROJECT_PLAN.md** - 项目规划
- **IMPLEMENTATION_GUIDE.md** - 实施指南

## 📊 当前状态

✅ **已完成 (~30%)**:
- 数据库架构 (13个表)
- 认证系统 (OAuth)
- 权限和积分系统
- 示例 API 路由

🚧 **待开发**:
- 完整 API 路由
- UI 组件
- 所有页面
- 编辑器和图片上传

查看 `IMPLEMENTATION_GUIDE.md` 了解详细开发步骤。
