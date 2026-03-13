# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 Monorepo 架构的全栈博客系统，使用 pnpm workspace + Turborepo 管理。

- **apps/web**: Next.js 前端展示端 (port 3000)
- **apps/admin**: React + Vite 管理后台 (port 3001)
- **apps/api**: Fastify + Prisma 后端 API (port 4000)
- **packages/shared-types**: 共享 TypeScript 类型
- **packages/shared-utils**: 共享工具函数 (slugify)

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 (Web) | Next.js 16 + React 19 + TypeScript + Tailwind CSS |
| 前端 (Admin) | React 18 + Vite + Ant Design + ProComponents |
| 后端 | Fastify + Prisma + PostgreSQL |
| 工具链 | pnpm + Turborepo + Biome + Husky |

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

**路由结构**:
- `/` - 首页 (文章列表)
- `/posts/[slug]` - 文章详情页
- `/categories/[slug]` - 分类文章列表
- `/tags/[slug]` - 标签文章列表
- `/api/auth/*` - NextAuth 认证路由
- `/api/comments` - 评论 API

**主题系统**:
- 使用 `next-themes` 实现明暗主题切换
- CSS 变量定义在 `src/styles/globals.css`
- 通过 `ThemeProvider` 和 `ThemeToggle` 组件控制
- 关键变量: `--bg-primary`, `--text-primary`, `--accent-cyan` 等
- 亮色模式通过 `.light` 类覆盖变量值
- Tailwind 配置中映射了所有 CSS 变量

### 管理后台 (apps/admin)

- React + Vite + React Router
- **Ant Design 5** + **ProComponents** (ProLayout, ProTable, ProForm)
- React Query 用于数据获取
- React Hook Form + Zod 用于表单（部分页面使用 Ant Design Form）
- 登录后 JWT 存储在 localStorage
- API 客户端在 `src/lib/api.ts`
- 使用 Ant Design 的中文语言包 `zh_CN`

**路由结构**:
- `/login` - 登录页
- `/` - Dashboard (文章统计)
- `/articles` - 文章列表
- `/articles/create` - 新建文章
- `/articles/edit/:id` - 编辑文章
- `/categories` - 分类管理
- `/tags` - 标签管理
- `/comments` - 评论审核
- `/user/profile` - 个人资料
- `/user/change-password` - 修改密码

## Key Files

```
# 配置
.env.example                     # 环境变量模板
docker-compose.yml               # Docker 部署配置
turbo.json                       # Turborepo 配置

# 后端
apps/api/.env                    # 后端环境变量
apps/api/prisma/schema.prisma    # 数据库模型
apps/api/src/plugins/auth.ts     # JWT 认证插件
apps/api/src/utils/password.ts   # bcrypt 密码工具

# Web 前端
apps/web/.env                    # 前端环境变量
apps/web/src/lib/api.ts          # Web API 客户端
apps/web/src/styles/globals.css  # 全局样式 + CSS 变量
apps/web/src/providers/ThemeProvider.tsx  # 主题上下文
apps/web/src/components/ThemeToggle.tsx   # 主题切换按钮

# 管理后台
apps/admin/.env                  # 管理后台环境变量
apps/admin/src/lib/api.ts        # Admin API 客户端
apps/admin/src/hooks/useAuth.ts  # 认证 Hook
apps/admin/src/App.tsx           # 路由配置

# 共享包
packages/shared-types/src/       # 共享 TypeScript 类型
packages/shared-utils/src/       # 共享工具函数
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

### 主题适配注意事项

**Web 端组件开发时**:
- 使用 CSS 变量或 Tailwind 主题类，避免硬编码颜色
- 推荐: `bg-text-primary`, `text-bg-primary`, `text-text-primary`
- 避免: `bg-white`, `bg-gray-100`, `text-black`
- 按钮/卡片等需要与背景形成对比的元素，使用反转配色方案

**示例**:
```tsx
// ✅ 正确 - 主题感知
<button className="bg-text-primary text-bg-primary">

// ❌ 错误 - 固定颜色
<button className="bg-white text-gray-900">
```

## Admin Credentials

- 用户名: `admin`
- 密码: `admin123`
- 修改密码: `cd apps/api && npx tsx scripts/hash-password.ts 新密码`

## Docker Deployment

### 部署架构

- **postgres**: PostgreSQL 16 数据库
- **api**: Fastify 后端 API (port 4000)
- **web**: Next.js 前端展示 (port 3000)
- **admin**: React 管理后台 (静态文件)
- **nginx**: 反向代理，对外暴露 80 端口

### 首次部署步骤

```bash
# 1. 准备环境变量文件
cp .env.example .env
# 编辑 .env 填入实际值

# 2. 构建并启动服务
docker-compose up -d

# 3. 运行数据库迁移
docker-compose exec api npx prisma migrate deploy

# 4. 查看日志
docker-compose logs -f

# 5. 停止服务
docker-compose down

# 6. 完全清理（包括数据卷）
docker-compose down -v
```

### 备份数据

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U blog blog > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U blog blog < backup.sql
```

## Environment Variables

项目使用 `.env.example` 作为模板，各应用的 `.env` 文件基于该模板创建。

### 后端 (apps/api/.env)
```
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/blog
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...
```

### Web 前端 (apps/web/.env)
```
API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 管理后台 (apps/admin/.env)
```
VITE_API_URL=http://localhost:4000
```

**注意**: 生产部署时使用统一的 `.env` 文件，通过 Docker Compose 注入到各服务。
