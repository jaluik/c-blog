# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 Monorepo 架构的全栈博客系统，使用 pnpm workspace + Turborepo 管理。

- **apps/web**: Next.js 前端展示端 (port 3000)
- **apps/admin**: React + Vite 管理后台 (port 3001)
- **apps/api**: Fastify + Prisma 后端 API (port 4000)
- **packages/shared-types**: 共享 TypeScript 类型
- **packages/shared-utils**: 共享工具函数 (slugify)

## Common Commands

```bash
# 安装依赖
pnpm install

# 开发模式（同时启动所有服务）
pnpm dev

# 单独启动服务
pnpm --filter @blog/api dev      # 仅 API
pnpm --filter @blog/web dev      # 仅 Web
pnpm --filter @blog/admin dev    # 仅 Admin

# 数据库操作
pnpm db:migrate                  # 运行 Prisma 迁移
pnpm db:generate                 # 生成 Prisma Client
pnpm db:seed                     # 导入初始数据

# 代码规范（使用 Biome）
pnpm lint                        # 检查代码
pnpm format                      # 格式化代码
pnpm check                       # 检查并自动修复

# 构建
pnpm build                       # 构建所有服务
```

## Architecture

### 后端 API (apps/api)

**路由结构** (`src/routes/`):
- `public/` - 公开接口（无需认证）
  - `posts.ts` - 文章列表/详情
  - `categories.ts`, `tags.ts` - 分类/标签
  - `comments.ts` - 评论获取
- `admin/` - 管理员接口（需 JWT）
  - `posts.ts`, `categories.ts`, `tags.ts` - CRUD
  - `comments.ts` - 评论审核
  - `upload.ts` - 文件上传
- `auth/` - 认证接口
  - `admin.ts` - 管理员登录
  - `github.ts` - GitHub OAuth

**认证机制**:
- 管理员使用账号密码登录，返回 JWT
- JWT 通过 `Authorization: Bearer <token>` 头部传递
- 使用 `app.authenticateAdmin` hook 保护管理员路由

**数据库**:
- Prisma ORM，PostgreSQL
- Schema 定义在 `prisma/schema.prisma`
- 包含: Article, Category, Tag, Comment, Admin 表

### 前端展示端 (apps/web)

- **Pages Router** (不是 App Router)
- 数据获取使用 `getStaticProps` / `getStaticPaths` + ISR
- API 客户端在 `src/lib/api.ts`
- Markdown 渲染使用 `react-markdown` + `rehype-highlight`
- 认证使用 NextAuth.js + GitHub OAuth

### 管理后台 (apps/admin)

- React + Vite + React Router
- React Query 用于数据获取
- React Hook Form + Zod 用于表单
- 登录后 JWT 存储在 localStorage
- API 客户端在 `src/lib/api.ts`

## Key Files

```
apps/api/.env                    # 后端环境变量
apps/api/prisma/schema.prisma    # 数据库模型
apps/api/src/plugins/auth.ts     # JWT 认证插件
apps/api/src/utils/password.ts   # bcrypt 密码工具
apps/web/.env                    # 前端环境变量
apps/web/src/lib/api.ts          # Web API 客户端
apps/admin/src/lib/api.ts        # Admin API 客户端
apps/admin/src/hooks/useAuth.ts  # 认证 Hook
packages/shared-types/src/       # 共享类型定义
```

## Development Notes

### 添加新 API 端点

1. 在 `apps/api/src/routes/` 下创建路由文件
2. 根据权限放入 `public/`, `admin/`, 或 `auth/` 目录
3. 在 `apps/api/src/index.ts` 注册路由
4. 如需认证，使用 `app.authenticate` 或 `app.authenticateAdmin`

### 数据库变更

1. 修改 `apps/api/prisma/schema.prisma`
2. 运行 `pnpm db:generate` 生成 Prisma Client
3. 运行 `pnpm db:migrate` 创建迁移

### 代码规范

- 使用 Biome 进行 lint 和 format
- 提交前运行 `pnpm check`
- 类型定义优先放在 `packages/shared-types`

## Admin Credentials

- 用户名: `admin`
- 密码: `admin123`
- 修改密码: `cd apps/api && npx tsx scripts/hash-password.ts 新密码`

## Docker Deployment

```bash
# 生产部署
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

## Environment Variables

### apps/api/.env
```
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/blog
JWT_SECRET=your_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...
```

### apps/web/.env
```
API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```
