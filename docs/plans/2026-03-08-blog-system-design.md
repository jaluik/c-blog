# 博客系统设计方案

> 创建日期: 2026-03-08
> 架构模式: Monorepo (Turborepo + pnpm workspace)

---

## 1. 项目概述

### 1.1 目标
构建一个功能完善的全栈博客系统，包含：
- SEO 友好的前端展示端
- 独立的文章管理后台
- RESTful API 后端
- Docker 一体化部署

### 1.2 核心功能
| 模块 | 功能 |
|-----|------|
| 前端展示端 | 文章浏览、分类筛选、标签云、GitHub OAuth 评论 |
| 文章管理端 | 文章 CRUD、Markdown 编辑器、分类/标签管理、评论审核 |
| 接口后端 | RESTful API、JWT 认证、图片上传、PostgreSQL 数据存储 |

---

## 2. 技术栈

### 2.1 整体架构
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   前端展示端     │     │   文章管理端     │     │    接口后端      │
│   (Next.js)     │     │   (React+Vite)  │     │  (Fastify+Node) │
│   Port: 3000    │     │   Port: 3001    │     │   Port: 4000    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      PostgreSQL         │
                    │        Port: 5432       │
                    └─────────────────────────┘
```

### 2.2 技术选型

| 模块 | 技术 | 说明 |
|-----|------|------|
| 前端展示端 | Next.js 15 + React 19 + TypeScript | SSR/SSG, SEO 友好 |
| 文章管理端 | React 18 + Vite + TypeScript | 快速开发，热更新 |
| 接口后端 | Fastify + Prisma + PostgreSQL | 高性能，类型安全 |
| UI 组件 | Tailwind CSS + shadcn/ui | 现代美观 |
| 编辑器 | @uiw/react-md-editor | Markdown 编辑 |
| 认证 | GitHub OAuth (展示端评论) + 账号密码 (管理端) | |
| 工具链 | pnpm + Turborepo + Biome | Monorepo 管理 |
| 部署 | Docker + Docker Compose + Nginx | 一体化部署 |

---

## 3. 数据库设计 (PostgreSQL)

### 3.1 表结构

```sql
-- 文章表
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,              -- Markdown 内容
    summary TEXT,                        -- 摘要
    cover_image VARCHAR(500),            -- 封面图 URL
    status VARCHAR(20) DEFAULT 'draft',  -- draft | published
    category_id INTEGER REFERENCES categories(id),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT
);

-- 分类表
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 标签表
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- 文章-标签关联表
CREATE TABLE article_tags (
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 评论表（需要 GitHub 登录）
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,  -- 嵌套回复
    github_user_id VARCHAR(50) NOT NULL,
    github_username VARCHAR(100) NOT NULL,
    github_avatar VARCHAR(500),
    content TEXT NOT NULL,               -- Markdown 内容
    is_approved BOOLEAN DEFAULT false,   -- 先发后审
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员表（文章管理端登录用）
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt 加密
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 索引设计
```sql
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_comments_article ON comments(article_id, created_at DESC);
CREATE INDEX idx_comments_approval ON comments(article_id, is_approved);
```

---

## 4. 认证策略

| 端 | 认证方式 | 说明 |
|---|---------|------|
| 前端展示端 | GitHub OAuth | 游客可浏览，发表评论时触发登录 |
| 文章管理端 | 账号密码 | 独立认证，仅管理员可登录 |
| 后端 API | JWT Token | 区分普通用户/管理员权限 |

**JWT Payload 结构：**
```typescript
// 普通用户（GitHub 登录）
{ userId: string, username: string, type: 'user' }

// 管理员
{ userId: number, username: string, type: 'admin' }
```

---

## 5. 模块详细设计

### 5.1 前端展示端 (Next.js)

**目录结构：**
```
apps/web/src/
├── app/
│   ├── page.tsx                 # 首页 - 文章列表
│   ├── posts/
│   │   └── [slug]/page.tsx      # 文章详情（ISR）
│   ├── categories/
│   │   └── [slug]/page.tsx      # 分类文章
│   ├── tags/
│   │   └── [slug]/page.tsx      # 标签文章
│   ├── about/page.tsx           # 关于页面
│   ├── layout.tsx               # 根布局（SEO 模板）
│   └── api/auth/[...nextauth]/  # NextAuth 路由
├── components/
│   ├── PostCard.tsx
│   ├── PostContent.tsx          # Markdown 渲染
│   ├── CommentSection/          # 评论区
│   │   ├── index.tsx
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   └── GitHubLogin.tsx
│   └── ui/                      # shadcn 组件
├── lib/
│   ├── api.ts                   # API 客户端
│   └── utils.ts
└── types/
    └── index.ts
```

**核心特性：**
- **ISR (增量静态再生)**：文章详情页构建时生成，更新后自动刷新
- **SEO**：每个页面自定义 title/description/OpenGraph
- **Markdown 渲染**：next-mdx-remote + 代码高亮 (shiki)
- **评论系统**：GitHub OAuth 登录，嵌套回复，Markdown 支持

### 5.2 文章管理端 (React + Vite)

**目录结构：**
```
apps/admin/src/
├── pages/
│   ├── Login.tsx                # 管理员登录
│   ├── Dashboard.tsx            # 仪表盘
│   ├── Posts/
│   │   ├── List.tsx             # 文章列表
│   │   ├── Create.tsx           # 新建文章
│   │   └── Edit.tsx             # 编辑文章
│   ├── Categories/
│   │   ├── List.tsx
│   │   └── Form.tsx
│   ├── Tags/
│   │   ├── List.tsx
│   │   └── Form.tsx
│   └── Comments/
│       └── List.tsx             # 评论审核/管理
├── components/
│   ├── MarkdownEditor.tsx       # Markdown 编辑器
│   ├── ImageUploader.tsx        # 封面图上传
│   ├── Layout.tsx               # 后台布局
│   └── AuthGuard.tsx            # 路由守卫
├── hooks/
│   ├── useAuth.ts
│   └── useApi.ts
├── api/
│   └── client.ts                # axios 封装
└── types/
    └── index.ts
```

**编辑器功能：**
- Markdown 实时预览（双栏模式）
- 图片拖拽上传（支持粘贴板）
- 自动保存草稿（localStorage）
- 封面图裁剪上传

### 5.3 接口后端 (Fastify)

**目录结构：**
```
apps/api/src/
├── routes/
│   ├── public/                  # 公开接口
│   │   ├── posts.ts             # GET /posts, /posts/:slug
│   │   ├── categories.ts        # GET /categories
│   │   ├── tags.ts              # GET /tags
│   │   └── comments.ts          # GET/POST /comments
│   ├── auth/
│   │   ├── github.ts            # GitHub OAuth
│   │   └── admin.ts             # 管理员登录
│   └── admin/                   # 需管理员权限
│       ├── posts.ts             # 文章 CRUD
│       ├── categories.ts
│       ├── tags.ts
│       └── comments.ts          # 评论审核/删除
├── plugins/
│   ├── prisma.ts                # Prisma 客户端
│   ├── auth.ts                  # JWT 验证装饰器
│   └── storage.ts               # 文件存储
├── utils/
│   ├── password.ts              # 密码加密
│   └── markdown.ts              # Markdown 处理
├── prisma/
│   └── schema.prisma
└── index.ts
```

**API 路由：**
```
# 公开接口
GET    /api/posts                 # 文章列表（分页）
GET    /api/posts/:slug           # 文章详情
GET    /api/categories            # 分类列表
GET    /api/tags                  # 标签列表
GET    /api/comments?articleId=   # 评论列表（已审核）
POST   /api/comments              # 发表评论（需登录）

# 认证接口
POST   /api/auth/github           # GitHub OAuth 回调
POST   /api/auth/admin/login      # 管理员登录

# 管理员接口（需管理员 JWT）
GET    /api/admin/posts           # 文章列表（含草稿）
POST   /api/admin/posts           # 创建文章
PUT    /api/admin/posts/:id       # 更新文章
DELETE /api/admin/posts/:id       # 删除文章
PATCH  /api/admin/comments/:id    # 审核/删除评论
```

---

## 6. Docker 部署设计

### 6.1 目录结构
```
blog-system/
├── docker-compose.yml
├── Dockerfile.web
├── Dockerfile.admin
├── Dockerfile.api
└── nginx/
    └── nginx.conf
```

### 6.2 服务编排
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: blog
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      DATABASE_URL: postgresql://blog:${DB_PASSWORD}@postgres:5432/blog
      JWT_SECRET: ${JWT_SECRET}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
      ADMIN_PASSWORD_HASH: ${ADMIN_PASSWORD_HASH}
    depends_on:
      - postgres
    volumes:
      - uploads:/app/uploads

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    environment:
      NEXT_PUBLIC_API_URL: /api
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}

  admin:
    build:
      context: .
      dockerfile: Dockerfile.admin
    environment:
      VITE_API_URL: /api

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - uploads:/var/www/uploads
    depends_on:
      - web
      - admin
      - api
```

### 6.3 Nginx 配置
```nginx
server {
    listen 80;
    server_name _;

    # 前端展示端
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
    }

    # 文章管理端
    location /admin {
        proxy_pass http://admin:3001;
        proxy_set_header Host $host;
    }

    # API 后端
    location /api {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
    }

    # 静态资源（上传的图片）
    location /uploads {
        alias /var/www/uploads;
    }
}
```

---

## 7. 项目结构（Monorepo）

```
blog-system/
├── apps/
│   ├── web/                     # 前端展示端 (Next.js)
│   ├── admin/                   # 文章管理端 (React + Vite)
│   └── api/                     # 接口后端 (Fastify)
├── packages/
│   ├── shared-types/            # 共享 TypeScript 类型
│   │   └── src/
│   │       ├── post.ts
│   │       ├── category.ts
│   │       ├── tag.ts
│   │       ├── comment.ts
│   │       └── api.ts
│   └── shared-utils/            # 共享工具函数
│       └── src/
│           ├── slugify.ts
│           └── date.ts
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
└── package.json
```

---

## 8. 开发流程

### 8.1 环境要求
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 8.2 开发命令
```bash
# 安装依赖
pnpm install

# 启动开发环境（同时启动所有服务）
pnpm dev

# 构建
pnpm build

# 代码检查和格式化
pnpm lint
pnpm format

# Docker 部署
docker-compose up -d
```

---

## 9. 关键设计决策

| 决策 | 选择 | 理由 |
|-----|------|------|
| Monorepo | Turborepo + pnpm | 代码复用，类型共享，统一构建 |
| 前端展示端 | Next.js App Router | 原生 SSR/SSG，SEO 友好 |
| 后端框架 | Fastify | 性能优于 Express，TypeScript 友好 |
| ORM | Prisma | 类型安全，自动迁移，开发体验好 |
| 数据库 | PostgreSQL | 全文搜索，稳定可靠，生态成熟 |
| 认证 | JWT + GitHub OAuth | 无状态，易于扩展 |
| 评论审核 | 先发后审 | 用户体验好，管理员可控 |
| 部署 | Docker Compose | 简单可靠，适合个人服务器 |

---

## 10. 未来扩展

- [ ] 文章搜索（全文搜索 / Elasticsearch）
- [ ] 文章系列（Series）功能
- [ ] 文章访问量统计
- [ ] RSS/Atom 订阅
- [ ] 邮件订阅通知
- [ ] 多主题切换
- [ ] 暗色模式

---

## 附录

### 环境变量清单

```bash
# 数据库
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_app_id
GITHUB_CLIENT_SECRET=your_github_app_secret

# NextAuth (前端展示端)
NEXTAUTH_URL=http://localhost
NEXTAUTH_SECRET=your_nextauth_secret

# 管理员密码（bcrypt hash）
ADMIN_PASSWORD_HASH=$2b$10$...
```
