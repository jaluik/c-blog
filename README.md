# 博客系统

一个基于 Monorepo 架构的全栈博客系统，包含前端展示端、文章管理端和接口后端。

## 技术栈

### 前端展示端 (apps/web)
- **Next.js 14** + **React 18** + **TypeScript**
- **Tailwind CSS** - 原子化 CSS 框架
- **react-markdown** + **remark-gfm** + **rehype-highlight** - Markdown 渲染与代码高亮
- **next-auth** - 用户认证 (GitHub OAuth)
- **swr** - 数据获取

### 文章管理端 (apps/admin)
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS**
- **React Router** - 客户端路由
- **React Query** - 服务端状态管理
- **React Hook Form** + **Zod** - 表单管理与验证
- **@uiw/react-md-editor** - Markdown 编辑器

### 接口后端 (apps/api)
- **Fastify** - 高性能 Node.js 框架
- **Prisma** - ORM 数据库访问
- **PostgreSQL** - 关系型数据库
- **Zod** - 数据验证
- **bcrypt** - 密码加密
- **@fastify/jwt** - JWT 认证
- **@fastify/multipart** - 文件上传

### 共享包 (packages)
- **shared-types** - TypeScript 类型定义共享
- **shared-utils** - 工具函数共享 (slugify 等)

### 部署
- **Docker** + **Docker Compose**
- **Nginx** - 反向代理与静态文件服务

## 功能特性

### 公开功能
- 文章列表展示（支持分类/标签筛选、分页）
- 文章详情阅读（Markdown 渲染、代码高亮）
- 文章 SEO 优化（meta 标签）
- 分类和标签云

### 评论系统
- GitHub OAuth 登录
- Markdown 评论提交
- 评论嵌套回复
- **先发后审**机制

### 管理后台
- 管理员账号密码登录
- 文章 CRUD（Markdown 编辑器、图片上传）
- 分类/标签管理
- 评论审核与管理
- 图片上传管理

## 快速开始

### 环境要求
- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ (或 Docker)

### 1. 克隆仓库
```bash
git clone <repo-url>
cd blog-system
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 配置环境变量
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

编辑 `.env` 文件，配置必要的环境变量：
- `DATABASE_URL` - 数据库连接地址
- `JWT_SECRET` - JWT 签名密钥
- `ADMIN_PASSWORD_HASH` - 管理员密码哈希（见下文生成方法）
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth 配置（可选，用于评论功能）

### 4. 数据库设置

**使用 Docker 启动 PostgreSQL：**
```bash
docker run -d --name blog-postgres \
  -e POSTGRES_USER=blog \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blog \
  -p 5432:5432 \
  postgres:16-alpine
```

**运行数据库迁移：**
```bash
pnpm db:migrate
```

**Seed 初始数据：**
```bash
pnpm db:seed
```

### 5. 启动开发服务器
```bash
pnpm dev
```

服务将启动在：
- 前端展示端: http://localhost:3000
- 管理后台: http://localhost:3001
- API 接口: http://localhost:4000

## 管理员账号

### 初始账号

| 字段 | 值 |
|------|-----|
| **用户名** | `admin` |
| **密码** | `admin123` |

**登录地址：** http://localhost:3001/login

### 修改管理员密码

1. 生成新的密码哈希
```bash
cd apps/api
npx tsx scripts/hash-password.ts 你的新密码
# 输出: Password hash: $2b$10$xxxxx
```

2. 更新 `apps/api/.env` 文件
```bash
ADMIN_PASSWORD_HASH=$2b$10$xxxxx
```

3. 重启 API 服务
```bash
pnpm dev
```

## Docker 部署

### 1. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填写所有必要配置
```

### 2. 启动服务
```bash
docker-compose up -d
```

### 3. 初始化数据库
```bash
# 执行数据库迁移
docker-compose exec api pnpm db:migrate

# Seed 初始数据（可选）
docker-compose exec api pnpm db:seed
```

### 4. 访问应用
- 前端展示: http://localhost
- 管理后台: http://localhost/admin
- API 接口: http://localhost/api

### 5. 查看日志
```bash
docker-compose logs -f
```

### 6. 停止服务
```bash
docker-compose down
```

## 项目结构

```
blog-system/
├── apps/
│   ├── web/                 # 前端展示端 (Next.js)
│   │   ├── src/
│   │   │   ├── pages/       # Next.js 页面
│   │   │   │   ├── index.tsx         # 首页 - 文章列表
│   │   │   │   ├── posts/[slug].tsx  # 文章详情页
│   │   │   │   └── api/auth/         # NextAuth API 路由
│   │   │   ├── components/  # React 组件
│   │   │   │   ├── PostCard.tsx      # 文章卡片
│   │   │   │   └── MarkdownContent.tsx  # Markdown 渲染
│   │   │   ├── lib/         # 工具库
│   │   │   │   └── api.ts   # API 客户端
│   │   │   └── app/         # App Router 资源
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   ├── admin/               # 文章管理端 (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/       # 页面组件
│   │   │   │   └── Login.tsx         # 登录页
│   │   │   ├── hooks/       # 自定义 Hooks
│   │   │   │   └── useAuth.ts        # 认证 Hook
│   │   │   ├── lib/         # 工具库
│   │   │   │   └── api.ts   # API 客户端
│   │   │   └── App.tsx      # 应用入口
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── api/                 # 接口后端 (Fastify)
│       ├── src/
│       │   ├── routes/      # API 路由
│       │   │   ├── public/  # 公开路由
│       │   │   │   ├── posts.ts      # 文章列表/详情
│       │   │   │   ├── categories.ts # 分类列表
│       │   │   │   ├── tags.ts       # 标签列表
│       │   │   │   └── comments.ts   # 评论获取
│       │   │   ├── admin/   # 管理员路由（需认证）
│       │   │   │   ├── posts.ts      # 文章管理
│       │   │   │   ├── categories.ts # 分类管理
│       │   │   │   ├── tags.ts       # 标签管理
│       │   │   │   ├── comments.ts   # 评论管理
│       │   │   │   └── upload.ts     # 文件上传
│       │   │   └── auth/    # 认证路由
│       │   │       ├── admin.ts      # 管理员登录
│       │   │       └── github.ts     # GitHub OAuth
│       │   ├── plugins/     # Fastify 插件
│       │   │   ├── auth.ts           # JWT 认证插件
│       │   │   └── storage.ts        # 文件存储插件
│       │   ├── utils/       # 工具函数
│       │   │   └── password.ts       # 密码加密
│       │   └── index.ts     # 应用入口
│       ├── prisma/
│       │   ├── schema.prisma         # Prisma 数据模型
│       │   └── migrations/           # 数据库迁移
│       ├── scripts/         # 脚本工具
│       │   └── hash-password.ts      # 密码哈希生成
│       └── package.json
│
├── packages/                # 共享包
│   ├── shared-types/        # TypeScript 类型定义
│   │   └── src/
│   │       ├── post.ts      # 文章类型
│   │       ├── category.ts  # 分类类型
│   │       ├── tag.ts       # 标签类型
│   │       ├── comment.ts   # 评论类型
│       │   └── api.ts       # API 响应类型
│   └── shared-utils/        # 工具函数
│       └── src/
│           └── slugify.ts   # URL 友好的字符串生成
│
├── nginx/                   # Nginx 配置
│   ├── nginx.conf           # 主配置（反向代理）
│   └── admin.conf           # Admin 静态文件服务
├── docs/
│   └── plans/               # 设计文档
│       ├── 2026-03-08-blog-system-design.md
│       └── 2026-03-08-blog-system-implementation.md
├── docker-compose.yml       # Docker Compose 配置
├── Dockerfile.api           # API 服务镜像
├── Dockerfile.web           # Web 服务镜像
├── Dockerfile.admin         # Admin 服务镜像
├── package.json             # Monorepo 根配置
├── pnpm-workspace.yaml      # pnpm 工作区配置
├── turbo.json               # Turbo 配置
└── biome.json               # Biome 代码规范配置
```

## 常用命令

```bash
# 安装所有依赖
pnpm install

# 启动开发服务器（所有服务）
pnpm dev

# 单独启动服务
pnpm --filter @blog/api dev      # 仅 API
pnpm --filter @blog/web dev      # 仅 Web
pnpm --filter @blog/admin dev    # 仅 Admin

# 数据库操作
pnpm db:migrate                  # 运行迁移
pnpm db:generate                 # 生成 Prisma Client
pnpm db:seed                     # Seed 初始数据

# 代码检查与格式化
pnpm lint                        # 代码检查
pnpm format                      # 代码格式化
pnpm check                       # 检查并修复

# 构建
pnpm build                       # 构建所有服务

# Docker 部署
docker-compose up -d             # 启动
docker-compose down              # 停止
docker-compose logs -f           # 查看日志
```

## 环境变量说明

### apps/api/.env
| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | API 服务端口 | 4000 |
| `DATABASE_URL` | 数据库连接地址 | postgresql://user:pass@localhost:5432/blog |
| `JWT_SECRET` | JWT 签名密钥 | your_secret_key |
| `JWT_EXPIRES_IN` | JWT 过期时间 | 7d |
| `ADMIN_USERNAME` | 管理员用户名 | admin |
| `ADMIN_PASSWORD_HASH` | 管理员密码哈希 | $2b$10$... |
| `GITHUB_CLIENT_ID` | GitHub OAuth App ID | xxx |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | xxx |
| `UPLOAD_DIR` | 上传文件目录 | ./uploads |

### apps/web/.env
| 变量名 | 说明 | 示例 |
|--------|------|------|
| `API_URL` | API 服务地址 | http://localhost:4000 |
| `NEXTAUTH_URL` | NextAuth URL | http://localhost:3000 |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | your_secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App ID | xxx |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | xxx |

## API 端点

### 公开端点
- `GET /api/posts` - 文章列表
- `GET /api/posts/:slug` - 文章详情
- `GET /api/categories` - 分类列表
- `GET /api/tags` - 标签列表
- `GET /api/comments?articleId=` - 评论列表

### 认证端点
- `POST /api/auth/github` - GitHub OAuth 登录

### 管理员端点（需 JWT）
- `POST /api/auth/admin/login` - 管理员登录
- `GET /api/admin/posts` - 管理文章列表
- `POST /api/admin/posts` - 创建文章
- `PUT /api/admin/posts/:id` - 更新文章
- `DELETE /api/admin/posts/:id` - 删除文章
- `GET /api/admin/categories` - 分类管理
- `POST /api/admin/categories` - 创建分类
- `GET /api/admin/tags` - 标签管理
- `POST /api/admin/tags` - 创建标签
- `GET /api/admin/comments` - 评论管理
- `PATCH /api/admin/comments/:id` - 审核评论
- `POST /api/admin/upload` - 文件上传

## 许可证

MIT
