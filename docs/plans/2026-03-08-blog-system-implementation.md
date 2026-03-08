# 博客系统实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 构建一个全栈博客系统，包含前端展示端(Next.js + SEO)、文章管理端(React + Vite)、接口后端(Fastify + PostgreSQL)，支持 Docker 一体化部署

**Architecture:** Monorepo 架构使用 pnpm workspace + Turborepo，共享类型定义和工具函数。前端展示端使用 Next.js App Router 实现 SSR/ISR 保证 SEO；管理端使用 React + Vite 快速开发；后端使用 Fastify + Prisma + PostgreSQL 提供 RESTful API

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui + Fastify + Prisma + PostgreSQL + Docker

---

## Phase 1: 项目初始化与 Monorepo 搭建

### Task 1: 创建项目根目录结构

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `biome.json`
- Create: `.gitignore`

**Step 1: 创建根 package.json**

```json
{
  "name": "blog-system",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "db:migrate": "pnpm --filter @blog/api db:migrate",
    "db:generate": "pnpm --filter @blog/api db:generate",
    "db:seed": "pnpm --filter @blog/api db:seed"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.5.3",
    "turbo": "^1.12.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

**Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Step 3: 创建 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Step 4: 创建 biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

**Step 5: 创建 .gitignore**

```
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
.next/
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# IDE
.idea
.vscode

# OS
.DS_Store
Thumbs.db

# Database
*.db
postgres_data/

# Uploads
uploads/
```

**Step 6: 初始化 git 并提交**

Run:
```bash
git init
git add .
git commit -m "chore: initialize monorepo structure"
```

---

### Task 2: 创建共享类型包

**Files:**
- Create: `packages/shared-types/package.json`
- Create: `packages/shared-types/tsconfig.json`
- Create: `packages/shared-types/src/index.ts`
- Create: `packages/shared-types/src/post.ts`
- Create: `packages/shared-types/src/category.ts`
- Create: `packages/shared-types/src/tag.ts`
- Create: `packages/shared-types/src/comment.ts`
- Create: `packages/shared-types/src/api.ts`

**Step 1: 创建 packages/shared-types/package.json**

```json
{
  "name": "@blog/shared-types",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**Step 2: 创建 packages/shared-types/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Step 3: 创建类型定义文件**

`packages/shared-types/src/post.ts`:
```typescript
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: 'draft' | 'published';
  categoryId?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: 'draft' | 'published';
  categoryId?: number;
  tagIds?: number[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {}
```

`packages/shared-types/src/category.ts`:
```typescript
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}
```

`packages/shared-types/src/tag.ts`:
```typescript
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}
```

`packages/shared-types/src/comment.ts`:
```typescript
export interface Comment {
  id: number;
  articleId: number;
  parentId?: number;
  githubUserId: string;
  githubUsername: string;
  githubAvatar?: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface CreateCommentInput {
  articleId: number;
  parentId?: number;
  content: string;
}
```

`packages/shared-types/src/api.ts`:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
```

`packages/shared-types/src/index.ts`:
```typescript
export * from './post';
export * from './category';
export * from './tag';
export * from './comment';
export * from './api';
```

**Step 4: 安装依赖并构建**

Run:
```bash
cd packages/shared-types
pnpm install
pnpm build
cd ../..
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat: add shared types package"
```

---

### Task 3: 创建共享工具包

**Files:**
- Create: `packages/shared-utils/package.json`
- Create: `packages/shared-utils/tsconfig.json`
- Create: `packages/shared-utils/src/index.ts`
- Create: `packages/shared-utils/src/slugify.ts`

**Step 1: 创建 packages/shared-utils/package.json**

```json
{
  "name": "@blog/shared-utils",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**Step 2: 创建 packages/shared-utils/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Step 3: 创建 slugify.ts**

`packages/shared-utils/src/slugify.ts`:
```typescript
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
```

`packages/shared-utils/src/index.ts`:
```typescript
export * from './slugify';
```

**Step 4: 安装依赖并构建**

Run:
```bash
cd packages/shared-utils
pnpm install
pnpm build
cd ../..
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat: add shared utils package"
```

---

## Phase 2: 后端 API (Fastify + Prisma)

### Task 4: 初始化 API 项目

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/.env.example`
- Create: `apps/api/src/index.ts`

**Step 1: 创建 apps/api/package.json**

```json
{
  "name": "@blog/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx src/seed.ts"
  },
  "dependencies": {
    "@blog/shared-types": "workspace:*",
    "@blog/shared-utils": "workspace:*",
    "@fastify/cors": "^9.0.1",
    "@fastify/jwt": "^8.0.0",
    "@fastify/multipart": "^8.0.0",
    "@fastify/static": "^7.0.0",
    "@prisma/client": "^5.9.0",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.4.1",
    "fastify": "^4.26.0",
    "marked": "^12.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^20.11.0",
    "prisma": "^5.9.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

**Step 2: 创建 apps/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: 创建 apps/api/.env.example**

```
PORT=4000
DATABASE_URL=postgresql://blog:password@localhost:5432/blog
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
UPLOAD_DIR=./uploads
```

**Step 4: 创建基础入口文件**

`apps/api/src/index.ts`:
```typescript
import 'dotenv/config';
import fastify from 'fastify';

const app = fastify({ logger: true });

app.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

**Step 5: 安装依赖**

Run:
```bash
cd apps/api
pnpm install
```

**Step 6: 测试启动**

Run:
```bash
pnpm dev
```
Expected: Server running on port 4000

**Step 7: 测试健康检查**

Run (在另一个终端):
```bash
curl http://localhost:4000/health
```
Expected: `{"status":"ok"}`

停止 dev server (Ctrl+C)

**Step 8: 提交**

```bash
git add .
git commit -m "feat(api): initialize Fastify project"
```

---

### Task 5: 配置 Prisma 数据库

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/prisma.ts`

**Step 1: 创建 Prisma Schema**

`apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Article {
  id              Int      @id @default(autoincrement())
  title           String
  slug            String   @unique
  content         String
  summary         String?
  coverImage      String?
  status          String   @default("draft") // draft | published
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  viewCount       Int      @default(0)
  metaTitle       String?
  metaDescription String?

  categoryId      Int?
  category        Category? @relation(fields: [categoryId], references: [id])
  tags            ArticleTag[]
  comments        Comment[]

  @@index([slug])
  @@index([status, publishedAt])
  @@index([categoryId])
  @@map("articles")
}

model Category {
  id          Int       @id @default(autoincrement())
  name        String
  slug        String    @unique
  description String?
  sortOrder   Int       @default(0)
  articles    Article[]

  @@map("categories")
}

model Tag {
  id       Int          @id @default(autoincrement())
  name     String       @unique
  slug     String       @unique
  articles ArticleTag[]

  @@map("tags")
}

model ArticleTag {
  articleId Int
  tagId     Int
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
  @@map("article_tags")
}

model Comment {
  id             Int      @id @default(autoincrement())
  content        String
  isApproved     Boolean  @default(false)
  createdAt      DateTime @default(now())
  githubUserId   String
  githubUsername String
  githubAvatar   String?

  articleId Int
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  parentId  Int?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")

  @@index([articleId, createdAt])
  @@index([articleId, isApproved])
  @@map("comments")
}

model Admin {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())

  @@map("admins")
}
```

**Step 2: 创建 Prisma 客户端实例**

`apps/api/src/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Step 3: 生成 Prisma Client**

Run:
```bash
pnpm db:generate
```

**Step 4: 提交**

```bash
git add .
git commit -m "feat(api): setup Prisma schema"
```

---

### Task 6: 创建数据库迁移

**Prerequisite:** PostgreSQL 需要运行（本地或 Docker）

**Step 1: 启动 PostgreSQL（如果没有运行）**

Option A - Docker:
```bash
docker run -d \
  --name blog-postgres \
  -e POSTGRES_USER=blog \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blog \
  -p 5432:5432 \
  postgres:16-alpine
```

Option B - 使用已有的 PostgreSQL

**Step 2: 设置环境变量**

`apps/api/.env`:
```
PORT=4000
DATABASE_URL=postgresql://blog:password@localhost:5432/blog
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=
UPLOAD_DIR=./uploads
```

**Step 3: 创建并应用迁移**

Run:
```bash
pnpm db:migrate
```
Expected: 提示输入迁移名，输入 `init`，迁移成功应用

**Step 4: 验证数据库表**

Run:
```bash
docker exec -it blog-postgres psql -U blog -c "\dt"
```
Expected: 显示 articles, categories, tags, article_tags, comments, admins 表

**Step 5: 提交**

```bash
git add .
git commit -m "feat(api): add initial database migration"
```

---

### Task 7: 添加数据库 Seed 数据

**Files:**
- Create: `apps/api/src/seed.ts`

**Step 1: 创建 seed 文件**

`apps/api/src/seed.ts`:
```typescript
import { prisma } from './prisma';

async function main() {
  // 创建分类
  const category1 = await prisma.category.create({
    data: {
      name: '技术',
      slug: 'tech',
      description: '技术文章',
      sortOrder: 1,
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: '生活',
      slug: 'life',
      description: '生活随笔',
      sortOrder: 2,
    },
  });

  // 创建标签
  const tag1 = await prisma.tag.create({
    data: { name: 'React', slug: 'react' },
  });

  const tag2 = await prisma.tag.create({
    data: { name: 'TypeScript', slug: 'typescript' },
  });

  const tag3 = await prisma.tag.create({
    data: { name: 'Node.js', slug: 'nodejs' },
  });

  // 创建示例文章
  await prisma.article.create({
    data: {
      title: '欢迎来到我的博客',
      slug: 'welcome-to-my-blog',
      content: '# 欢迎来到我的博客\n\n这是一篇示例文章。\n\n## 特性\n\n- Markdown 支持\n- 代码高亮\n- 评论系统',
      summary: '这是我的第一篇博客文章',
      status: 'published',
      publishedAt: new Date(),
      categoryId: category1.id,
      viewCount: 0,
      tags: {
        create: [{ tagId: tag1.id }, { tagId: tag2.id }],
      },
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: 运行 Seed**

Run:
```bash
pnpm db:seed
```
Expected: Seed data created successfully

**Step 3: 验证数据**

Run:
```bash
docker exec -it blog-postgres psql -U blog -c "SELECT title, status FROM articles;"
```
Expected: 显示 "欢迎来到我的博客" | "published"

**Step 4: 提交**

```bash
git add .
git commit -m "feat(api): add database seed script"
```

---

### Task 8: 实现公开文章 API

**Files:**
- Create: `apps/api/src/routes/public/posts.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: 创建公开文章路由**

`apps/api/src/routes/public/posts.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function publicPostRoutes(app: FastifyInstance) {
  // 获取文章列表
  app.get('/posts', async (request, reply) => {
    const { page = '1', pageSize = '10', category, tag } = request.query as {
      page?: string;
      pageSize?: string;
      category?: string;
      tag?: string;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: any = { status: 'published' };

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    const [posts, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: size,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
          _count: { select: { comments: { where: { isApproved: true } } } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      data: posts.map(p => ({
        ...p,
        tags: p.tags.map(t => t.tag),
        commentCount: p._count.comments,
        _count: undefined,
      })),
      meta: {
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    };
  });

  // 获取单篇文章（by slug）
  app.get('/posts/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const post = await prisma.article.findUnique({
      where: { slug, status: 'published' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { comments: { where: { isApproved: true } } } },
      },
    });

    if (!post) {
      return reply.status(404).send({ error: 'Article not found' });
    }

    // 增加浏览量
    await prisma.article.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...post,
      tags: post.tags.map(t => t.tag),
      commentCount: post._count.comments,
      _count: undefined,
    };
  });
}
```

**Step 2: 更新入口文件**

`apps/api/src/index.ts`:
```typescript
import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { publicPostRoutes } from './routes/public/posts';

const app = fastify({ logger: true });

// 注册 CORS
await app.register(cors, {
  origin: true,
  credentials: true,
});

// 健康检查
app.get('/health', async () => ({ status: 'ok' }));

// 公开路由
await app.register(publicPostRoutes, { prefix: '/api' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

**Step 3: 测试 API**

Run:
```bash
pnpm dev
```

在另一个终端测试:
```bash
curl http://localhost:4000/api/posts
curl http://localhost:4000/api/posts/welcome-to-my-blog
```

Expected: 返回文章列表和单篇文章数据

停止 dev server

**Step 4: 提交**

```bash
git add .
git commit -m "feat(api): add public post routes"
```

---

### Task 9: 实现分类和标签 API

**Files:**
- Create: `apps/api/src/routes/public/categories.ts`
- Create: `apps/api/src/routes/public/tags.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: 创建分类路由**

`apps/api/src/routes/public/categories.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/categories', async () => {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { articles: { where: { status: 'published' } } } },
      },
    });

    return {
      data: categories.map(c => ({
        ...c,
        articleCount: c._count.articles,
        _count: undefined,
      })),
    };
  });
}
```

**Step 2: 创建标签路由**

`apps/api/src/routes/public/tags.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function tagRoutes(app: FastifyInstance) {
  app.get('/tags', async () => {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { articles: { where: { article: { status: 'published' } } } } },
      },
    });

    return {
      data: tags.map(t => ({
        ...t,
        articleCount: t._count.articles,
        _count: undefined,
      })),
    };
  });
}
```

**Step 3: 更新入口文件**

`apps/api/src/index.ts`:
```typescript
import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { publicPostRoutes } from './routes/public/posts';
import { categoryRoutes } from './routes/public/categories';
import { tagRoutes } from './routes/public/tags';

const app = fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
});

app.get('/health', async () => ({ status: 'ok' }));

// 公开路由
await app.register(publicPostRoutes, { prefix: '/api' });
await app.register(categoryRoutes, { prefix: '/api' });
await app.register(tagRoutes, { prefix: '/api' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

**Step 4: 测试 API**

Run:
```bash
pnpm dev
```

测试:
```bash
curl http://localhost:4000/api/categories
curl http://localhost:4000/api/tags
```

Expected: 返回分类列表和标签列表

停止 dev server

**Step 5: 提交**

```bash
git add .
git commit -m "feat(api): add category and tag routes"
```

---

### Task 10: 实现评论 API

**Files:**
- Create: `apps/api/src/routes/public/comments.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: 创建评论路由**

`apps/api/src/routes/public/comments.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { z } from 'zod';

const createCommentSchema = z.object({
  articleId: z.number(),
  parentId: z.number().optional(),
  content: z.string().min(1).max(5000),
});

export async function commentRoutes(app: FastifyInstance) {
  // 获取文章评论（只返回已审核的）
  app.get('/comments', async (request, reply) => {
    const { articleId } = request.query as { articleId: string };

    if (!articleId) {
      return reply.status(400).send({ error: 'articleId is required' });
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId: Number(articleId),
        isApproved: true,
        parentId: null, // 只获取顶级评论
      },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          where: { isApproved: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return { data: comments };
  });

  // 发表评论（需要 JWT）
  app.post('/comments', async (request, reply) => {
    // TODO: 验证 JWT
    const body = createCommentSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input', details: body.error });
    }

    // TODO: 获取当前用户信息
    const { articleId, parentId, content } = body.data;

    const comment = await prisma.comment.create({
      data: {
        articleId,
        parentId,
        content,
        githubUserId: 'temp', // 从 JWT 获取
        githubUsername: 'temp',
        isApproved: false, // 先发后审
      },
    });

    return { data: comment, message: 'Comment submitted for moderation' };
  });
}
```

**Step 2: 更新入口文件**

在 `apps/api/src/index.ts` 添加:
```typescript
import { commentRoutes } from './routes/public/comments';
// ...
await app.register(commentRoutes, { prefix: '/api' });
```

**Step 3: 测试获取评论**

Run:
```bash
pnpm dev
```

测试:
```bash
curl "http://localhost:4000/api/comments?articleId=1"
```

Expected: 返回空数组（暂无审核通过的评论）

停止 dev server

**Step 4: 提交**

```bash
git add .
git commit -m "feat(api): add comment routes (get and create)"
```

---

### Task 11: 实现管理员认证

**Files:**
- Create: `apps/api/src/utils/password.ts`
- Create: `apps/api/src/routes/auth/admin.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/.env`

**Step 1: 创建密码工具**

`apps/api/src/utils/password.ts`:
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Step 2: 创建管理员认证路由**

`apps/api/src/routes/auth/admin.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { verifyPassword } from '../../utils/password';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function adminAuthRoutes(app: FastifyInstance) {
  app.post('/auth/admin/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const { username, password } = body.data;

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = app.jwt.sign({
      userId: admin.id,
      username: admin.username,
      type: 'admin',
    });

    return { data: { token, username: admin.username } };
  });
}
```

**Step 3: 配置 JWT 插件**

`apps/api/src/index.ts`:
```typescript
import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { publicPostRoutes } from './routes/public/posts';
import { categoryRoutes } from './routes/public/categories';
import { tagRoutes } from './routes/public/tags';
import { commentRoutes } from './routes/public/comments';
import { adminAuthRoutes } from './routes/auth/admin';

const app = fastify({ logger: true });

// 注册 CORS
await app.register(cors, {
  origin: true,
  credentials: true,
});

// 注册 JWT
await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
});

app.get('/health', async () => ({ status: 'ok' }));

// 公开路由
await app.register(publicPostRoutes, { prefix: '/api' });
await app.register(categoryRoutes, { prefix: '/api' });
await app.register(tagRoutes, { prefix: '/api' });
await app.register(commentRoutes, { prefix: '/api' });

// 认证路由
await app.register(adminAuthRoutes, { prefix: '/api' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

**Step 4: 生成管理员密码哈希**

创建一个临时脚本 `apps/api/scripts/hash-password.ts`:
```typescript
import { hashPassword } from '../src/utils/password';

async function main() {
  const password = process.argv[2] || 'admin123';
  const hash = await hashPassword(password);
  console.log('Password hash:', hash);
}

main();
```

Run:
```bash
npx tsx scripts/hash-password.ts your_admin_password
```

**Step 5: 更新 .env 并创建管理员**

`apps/api/.env`:
```
ADMIN_PASSWORD_HASH=$2b$10$... # 上一步生成的哈希
```

创建管理员迁移脚本 `apps/api/scripts/create-admin.ts`:
```typescript
import { prisma } from '../src/prisma';

async function main() {
  const existing = await prisma.admin.findFirst();
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  await prisma.admin.create({
    data: {
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash: process.env.ADMIN_PASSWORD_HASH!,
    },
  });

  console.log('Admin created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run:
```bash
npx tsx scripts/create-admin.ts
```

**Step 6: 测试登录**

Run:
```bash
pnpm dev
```

测试:
```bash
curl -X POST http://localhost:4000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

Expected: 返回 { data: { token, username } }

停止 dev server

**Step 7: 提交**

```bash
git add .
git commit -m "feat(api): add admin authentication with JWT"
```

---

### Task 12: 实现管理员文章管理 API

**Files:**
- Create: `apps/api/src/plugins/auth.ts`
- Create: `apps/api/src/routes/admin/posts.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: 创建认证插件**

`apps/api/src/plugins/auth.ts`:
```typescript
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: {
      userId: number;
      username: string;
      type: 'admin' | 'user';
    };
  }
}

export default fp(async function (app: FastifyInstance) {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{ userId: number; username: string; type: string }>();
      request.user = decoded;
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  app.decorate('authenticateAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{ userId: number; username: string; type: string }>();
      if (decoded.type !== 'admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }
      request.user = decoded;
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
});
```

**Step 2: 创建管理员文章路由**

`apps/api/src/routes/admin/posts.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { z } from 'zod';
import { slugify } from '@blog/shared-utils';

const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().optional(),
  content: z.string().min(1),
  summary: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['draft', 'published']),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updatePostSchema = createPostSchema.partial();

export async function adminPostRoutes(app: FastifyInstance) {
  // 所有路由需要管理员认证
  app.addHook('onRequest', app.authenticateAdmin);

  // 获取文章列表（包含草稿）
  app.get('/admin/posts', async (request) => {
    const { page = '1', pageSize = '10', status } = request.query as {
      page?: string;
      pageSize?: string;
      status?: string;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: any = {};
    if (status) where.status = status;

    const [posts, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      data: posts.map(p => ({
        ...p,
        tags: p.tags.map(t => t.tag),
        _count: undefined,
      })),
      meta: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    };
  });

  // 获取单篇文章（完整数据）
  app.get('/admin/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const post = await prisma.article.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return reply.status(404).send({ error: 'Article not found' });
    }

    return { ...post, tags: post.tags.map(t => t.tag) };
  });

  // 创建文章
  app.post('/admin/posts', async (request, reply) => {
    const body = createPostSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input', details: body.error });
    }

    const data = body.data;
    const slug = data.slug || slugify(data.title);

    // 检查 slug 是否已存在
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return reply.status(400).send({ error: 'Slug already exists' });
    }

    const post = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        summary: data.summary,
        coverImage: data.coverImage,
        status: data.status,
        categoryId: data.categoryId,
        publishedAt: data.status === 'published' ? new Date() : null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        tags: data.tagIds ? {
          create: data.tagIds.map(tagId => ({ tagId })),
        } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return { data: post, message: 'Article created' };
  });

  // 更新文章
  app.put('/admin/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updatePostSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input', details: body.error });
    }

    const data = body.data;
    const existing = await prisma.article.findUnique({ where: { id: Number(id) } });

    if (!existing) {
      return reply.status(404).send({ error: 'Article not found' });
    }

    // 如果修改了 slug，检查唯一性
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.article.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return reply.status(400).send({ error: 'Slug already exists' });
      }
    }

    const post = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        summary: data.summary,
        coverImage: data.coverImage,
        status: data.status,
        categoryId: data.categoryId,
        publishedAt: data.status === 'published' && existing.status === 'draft'
          ? new Date()
          : undefined,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        tags: data.tagIds ? {
          deleteMany: {},
          create: data.tagIds.map(tagId => ({ tagId })),
        } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return { data: post, message: 'Article updated' };
  });

  // 删除文章
  app.delete('/admin/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.article.delete({
      where: { id: Number(id) },
    });

    return { message: 'Article deleted' };
  });
}
```

**Step 3: 更新入口文件**

`apps/api/src/index.ts`:
```typescript
import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import authPlugin from './plugins/auth';
import { publicPostRoutes } from './routes/public/posts';
import { categoryRoutes } from './routes/public/categories';
import { tagRoutes } from './routes/public/tags';
import { commentRoutes } from './routes/public/comments';
import { adminAuthRoutes } from './routes/auth/admin';
import { adminPostRoutes } from './routes/admin/posts';

const app = fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
});

await app.register(authPlugin);

app.get('/health', async () => ({ status: 'ok' }));

// 公开路由
await app.register(publicPostRoutes, { prefix: '/api' });
await app.register(categoryRoutes, { prefix: '/api' });
await app.register(tagRoutes, { prefix: '/api' });
await app.register(commentRoutes, { prefix: '/api' });

// 认证路由
await app.register(adminAuthRoutes, { prefix: '/api' });

// 管理员路由
await app.register(adminPostRoutes, { prefix: '/api' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

**Step 4: 添加 fastify-plugin 依赖**

Run:
```bash
pnpm add fastify-plugin
```

**Step 5: 测试管理员 API**

Run:
```bash
pnpm dev
```

获取 token:
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' | jq -r '.data.token')
```

测试文章列表:
```bash
curl http://localhost:4000/api/admin/posts \
  -H "Authorization: Bearer $TOKEN"
```

停止 dev server

**Step 6: 提交**

```bash
git add .
git commit -m "feat(api): add admin post management routes"
```

---

### Task 13: 实现管理员分类和标签管理 API

**Files:**
- Create: `apps/api/src/routes/admin/categories.ts`
- Create: `apps/api/src/routes/admin/tags.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: 创建分类管理路由**

`apps/api/src/routes/admin/categories.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { z } from 'zod';
import { slugify } from '@blog/shared-utils';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function adminCategoryRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticateAdmin);

  app.get('/admin/categories', async () => {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return { data: categories.map(c => ({ ...c, articleCount: c._count.articles, _count: undefined })) };
  });

  app.post('/admin/categories', async (request, reply) => {
    const body = categorySchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' });

    const data = body.data;
    const slug = data.slug || slugify(data.name);

    const category = await prisma.category.create({
      data: { ...data, slug },
    });
    return { data: category, message: 'Category created' };
  });

  app.put('/admin/categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = categorySchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' });

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: body.data,
    });
    return { data: category, message: 'Category updated' };
  });

  app.delete('/admin/categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.category.delete({ where: { id: Number(id) } });
    return { message: 'Category deleted' };
  });
}
```

**Step 2: 创建标签管理路由**

`apps/api/src/routes/admin/tags.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { z } from 'zod';
import { slugify } from '@blog/shared-utils';

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().optional(),
});

export async function adminTagRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticateAdmin);

  app.get('/admin/tags', async () => {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return { data: tags.map(t => ({ ...t, articleCount: t._count.articles, _count: undefined })) };
  });

  app.post('/admin/tags', async (request, reply) => {
    const body = tagSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' });

    const data = body.data;
    const slug = data.slug || slugify(data.name);

    const tag = await prisma.tag.create({
      data: { ...data, slug },
    });
    return { data: tag, message: 'Tag created' };
  });

  app.put('/admin/tags/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = tagSchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' });

    const tag = await prisma.tag.update({
      where: { id: Number(id) },
      data: body.data,
    });
    return { data: tag, message: 'Tag updated' };
  });

  app.delete('/admin/tags/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.tag.delete({ where: { id: Number(id) } });
    return { message: 'Tag deleted' };
  });
}
```

**Step 3: 更新入口文件**

在 `apps/api/src/index.ts` 添加:
```typescript
import { adminCategoryRoutes } from './routes/admin/categories';
import { adminTagRoutes } from './routes/admin/tags';
// ...
await app.register(adminCategoryRoutes, { prefix: '/api' });
await app.register(adminTagRoutes, { prefix: '/api' });
```

**Step 4: 提交**

```bash
git add .
git commit -m "feat(api): add admin category and tag management routes"
```

---

### Task 14: 实现管理员评论管理 API

**Files:**
- Create: `apps/api/src/routes/admin/comments.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: 创建评论管理路由**

`apps/api/src/routes/admin/comments.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function adminCommentRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticateAdmin);

  // 获取评论列表（包含待审核）
  app.get('/admin/comments', async (request) => {
    const { page = '1', pageSize = '20', articleId, isApproved } = request.query as {
      page?: string;
      pageSize?: string;
      articleId?: string;
      isApproved?: string;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: any = {};
    if (articleId) where.articleId = Number(articleId);
    if (isApproved !== undefined) where.isApproved = isApproved === 'true';

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      data: comments,
      meta: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    };
  });

  // 审核评论
  app.patch('/admin/comments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { isApproved } = request.body as { isApproved: boolean };

    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { isApproved },
    });

    return { data: comment, message: `Comment ${isApproved ? 'approved' : 'rejected'}` };
  });

  // 删除评论
  app.delete('/admin/comments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.comment.delete({ where: { id: Number(id) } });
    return { message: 'Comment deleted' };
  });
}
```

**Step 2: 更新入口文件**

在 `apps/api/src/index.ts` 添加:
```typescript
import { adminCommentRoutes } from './routes/admin/comments';
// ...
await app.register(adminCommentRoutes, { prefix: '/api' });
```

**Step 3: 提交**

```bash
git add .
git commit -m "feat(api): add admin comment management routes"
```

---

### Task 15: 实现图片上传功能

**Files:**
- Create: `apps/api/src/plugins/storage.ts`
- Create: `apps/api/src/routes/admin/upload.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/.env`

**Step 1: 创建存储插件**

`apps/api/src/plugins/storage.ts`:
```typescript
import fs from 'fs/promises';
import path from 'path';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export default fp(async function (app: FastifyInstance) {
  await ensureDir(UPLOAD_DIR);

  app.decorate('uploadFile', async (data: Buffer, filename: string): Promise<string> => {
    const date = new Date();
    const subDir = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dir = path.join(UPLOAD_DIR, subDir);
    await ensureDir(dir);

    const ext = path.extname(filename);
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filepath = path.join(dir, name);

    await fs.writeFile(filepath, data);
    return `/uploads/${subDir}/${name}`;
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    uploadFile: (data: Buffer, filename: string) => Promise<string>;
  }
}
```

**Step 2: 创建上传路由**

`apps/api/src/routes/admin/upload.ts`:
```typescript
import type { FastifyInstance } from 'fastify';

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticateAdmin);

  app.post('/admin/upload', async (request, reply) => {
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        const filename = part.filename;

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(part.mimetype)) {
          return reply.status(400).send({ error: 'Invalid file type' });
        }

        // 验证文件大小 (5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          return reply.status(400).send({ error: 'File too large (max 5MB)' });
        }

        const url = await app.uploadFile(buffer, filename);
        return { data: { url }, message: 'File uploaded' };
      }
    }

    return reply.status(400).send({ error: 'No file provided' });
  });
}
```

**Step 3: 更新入口文件**

`apps/api/src/index.ts`:
```typescript
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import path from 'path';
import storagePlugin from './plugins/storage';
import { uploadRoutes } from './routes/admin/upload';

// ... 在 register cors 之后添加:
await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
await app.register(storagePlugin);

// 静态文件服务
await app.register(staticPlugin, {
  root: path.join(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
  prefix: '/uploads/',
});

// ... 在管理员路由部分添加:
await app.register(uploadRoutes, { prefix: '/api' });
```

**Step 4: 创建 uploads 目录**

Run:
```bash
mkdir -p apps/api/uploads
echo "uploads/" >> apps/api/.gitignore
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat(api): add image upload functionality"
```

---

### Task 16: 添加 GitHub OAuth 支持

**Files:**
- Create: `apps/api/src/routes/auth/github.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/.env`

**Step 1: 创建 GitHub OAuth 路由**

`apps/api/src/routes/auth/github.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const githubCallbackSchema = z.object({
  code: z.string(),
});

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
}

export async function githubAuthRoutes(app: FastifyInstance) {
  // GitHub OAuth 回调
  app.post('/auth/github', async (request, reply) => {
    const body = githubCallbackSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const { code } = body.data;

    try {
      // 用 code 换 access_token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return reply.status(400).send({ error: tokenData.error_description });
      }

      // 获取用户信息
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const user: GitHubUser = await userRes.json();

      // 生成 JWT
      const token = app.jwt.sign({
        userId: user.id,
        username: user.login,
        avatar: user.avatar_url,
        type: 'user',
      });

      return {
        data: {
          token,
          user: {
            id: user.id,
            username: user.login,
            avatar: user.avatar_url,
          },
        },
      };
    } catch (err) {
      console.error('GitHub OAuth error:', err);
      return reply.status(500).send({ error: 'OAuth failed' });
    }
  });
}
```

**Step 2: 更新入口文件**

在 `apps/api/src/index.ts` 添加:
```typescript
import { githubAuthRoutes } from './routes/auth/github';
// ...
await app.register(githubAuthRoutes, { prefix: '/api' });
```

**Step 3: 更新评论路由（使用 JWT）**

修改 `apps/api/src/routes/public/comments.ts`:
```typescript
// 发表评论
app.post('/comments', {
  onRequest: [app.authenticate],
}, async (request, reply) => {
  const body = createCommentSchema.safeParse(request.body);

  if (!body.success) {
    return reply.status(400).send({ error: 'Invalid input', details: body.error });
  }

  const { articleId, parentId, content } = body.data;
  const user = request.user;

  const comment = await prisma.comment.create({
    data: {
      articleId,
      parentId,
      content,
      githubUserId: String(user.userId),
      githubUsername: user.username,
      githubAvatar: (user as any).avatar,
      isApproved: false,
    },
  });

  return { data: comment, message: 'Comment submitted for moderation' };
});
```

**Step 4: 更新认证插件（支持用户类型）**

修改 `apps/api/src/plugins/auth.ts`:
```typescript
app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const decoded = await request.jwtVerify<{ userId: number; username: string; type: string; avatar?: string }>();
    request.user = decoded;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat(api): add GitHub OAuth and update comment auth"
```

---

## Phase 3: 前端展示端 (Next.js)

### Task 17: 初始化 Next.js 项目

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/globals.css`

**Step 1: 创建 package.json**

`apps/web/package.json`:
```json
{
  "name": "@blog/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@blog/shared-types": "workspace:*",
    "@blog/shared-utils": "workspace:*",
    "next": "14.1.0",
    "next-auth": "^4.24.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "swr": "^2.2.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

**Step 2: 创建 tsconfig.json**

`apps/web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 3: 创建 Tailwind 配置**

`apps/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

**Step 4: 创建 PostCSS 配置**

`apps/web/postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 5: 创建 next.config.js**

`apps/web/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

**Step 6: 创建全局样式**

`apps/web/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
```

**Step 7: 创建根布局**

`apps/web/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '我的博客',
  description: '一个使用 Next.js 构建的个人博客',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Step 8: 安装依赖**

Run:
```bash
cd apps/web
pnpm install
```

**Step 9: 提交**

```bash
git add .
git commit -m "feat(web): initialize Next.js project"
```

---

### Task 18: 创建首页和文章列表

**Files:**
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/components/PostCard.tsx`

**Step 1: 创建 API 客户端**

`apps/web/src/lib/api.ts`:
```typescript
import type { Post, Category, Tag, PaginatedResponse } from '@blog/shared-types';

const API_BASE = '/api';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  posts: {
    list: (page = 1, pageSize = 10) =>
      fetchApi<PaginatedResponse<Post>>(`/posts?page=${page}&pageSize=${pageSize}`),
    get: (slug: string) => fetchApi<{ data: Post }>(`/posts/${slug}`).then(r => r.data),
  },
  categories: {
    list: () => fetchApi<{ data: Category[] }>('/categories').then(r => r.data),
  },
  tags: {
    list: () => fetchApi<{ data: Tag[] }>('/tags').then(r => r.data),
  },
};
```

**Step 2: 创建文章卡片组件**

`apps/web/src/components/PostCard.tsx`:
```typescript
import Link from 'next/link';
import type { Post } from '@blog/shared-types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">
          {post.title}
        </h2>
      </Link>

      {post.summary && (
        <p className="text-gray-600 mb-4 line-clamp-2">{post.summary}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('zh-CN')}
        </time>

        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="text-blue-600 hover:underline"
          >
            {post.category.name}
          </Link>
        )}

        {post.viewCount > 0 && (
          <span>{post.viewCount} 阅读</span>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mt-3">
          {post.tags.map(tag => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
```

**Step 3: 创建首页**

`apps/web/src/app/page.tsx`:
```typescript
import { api } from '@/lib/api';
import { PostCard } from '@/components/PostCard';

export const revalidate = 60; // ISR: 每分钟重新生成

export default async function HomePage() {
  const { data, meta } = await api.posts.list(1, 10);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">我的博客</h1>
          <p className="text-gray-600 mt-2">记录技术、分享生活</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {data.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {meta.totalPages > 1 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              第 {meta.page} 页，共 {meta.totalPages} 页
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 4: 创建 .env 文件**

`apps/web/.env`:
```
API_URL=http://localhost:4000
```

**Step 5: 测试开发服务器**

Run:
```bash
# Terminal 1: 启动 API
pnpm --filter @blog/api dev

# Terminal 2: 启动 Web
pnpm --filter @blog/web dev
```

访问 http://localhost:3000
Expected: 显示文章列表

**Step 6: 提交**

```bash
git add .
git commit -m "feat(web): add homepage with post list"
```

---

### Task 19: 创建文章详情页

**Files:**
- Create: `apps/web/src/app/posts/[slug]/page.tsx`
- Create: `apps/web/src/components/MarkdownContent.tsx`

**Step 1: 安装 Markdown 渲染依赖**

Run:
```bash
cd apps/web
pnpm add react-markdown remark-gfm rehype-highlight highlight.js
```

**Step 2: 创建 Markdown 内容组件**

`apps/web/src/components/MarkdownContent.tsx`:
```typescript
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                <code className={className}>{children}</code>
              </pre>
            );
          },
          ul: ({ children }) => <ul className="list-disc pl-6 my-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-4">{children}</ol>,
          li: ({ children }) => <li className="my-1">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**Step 3: 创建文章详情页**

`apps/web/src/app/posts/[slug]/page.tsx`:
```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { MarkdownContent } from '@/components/MarkdownContent';

interface PostPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const post = await api.posts.get(params.slug);
    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.summary,
    };
  } catch {
    return {
      title: '文章未找到',
    };
  }
}

export const revalidate = 60;

export default async function PostPage({ params }: PostPageProps) {
  const post = await api.posts.get(params.slug);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-gray-500">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('zh-CN')}
              </time>

              {post.category && (
                <Link
                  href={`/categories/${post.category.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.category.name}
                </Link>
              )}

              <span>{post.viewCount} 阅读</span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {post.tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          <MarkdownContent content={post.content} />
        </article>
      </main>
    </div>
  );
}
```

**Step 4: 测试**

访问 http://localhost:3000/posts/welcome-to-my-blog
Expected: 显示文章详情，Markdown 正确渲染

**Step 5: 提交**

```bash
git add .
git commit -m "feat(web): add post detail page with markdown rendering"
```

---

### Task 20: 添加 NextAuth GitHub OAuth

**Files:**
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/src/providers/AuthProvider.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/.env`

**Step 1: 配置 NextAuth**

`apps/web/src/lib/auth.ts`:
```typescript
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // 向后端换取 JWT
        const res = await fetch(`${process.env.API_URL}/api/auth/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: account.access_token }),
        });

        const data = await res.json();
        token.backendToken = data.data.token;
        token.userId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendToken = token.backendToken;
      (session as any).userId = token.userId;
      return session;
    },
  },
});
```

**Step 2: 创建 API 路由**

`apps/web/src/app/api/auth/[...nextauth]/route.ts`:
```typescript
export { GET, POST } from '@/lib/auth';
```

**Step 3: 创建 Auth Provider**

`apps/web/src/providers/AuthProvider.tsx`:
```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Step 4: 更新布局**

`apps/web/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '我的博客',
  description: '一个使用 Next.js 构建的个人博客',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**Step 5: 更新环境变量**

`apps/web/.env`:
```
API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Step 6: 提交**

```bash
git add .
git commit -m "feat(web): add NextAuth with GitHub OAuth"
```

---

## Phase 4: 文章管理端 (React + Vite)

### Task 21: 初始化 Vite 项目

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/vite.config.ts`
- Create: `apps/admin/tailwind.config.ts`
- Create: `apps/admin/postcss.config.js`
- Create: `apps/admin/index.html`
- Create: `apps/admin/src/main.tsx`
- Create: `apps/admin/src/App.tsx`

**Step 1: 创建 package.json**

`apps/admin/package.json`:
```json
{
  "name": "@blog/admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@blog/shared-types": "workspace:*",
    "@blog/shared-utils": "workspace:*",
    "@tanstack/react-query": "^5.18.0",
    "axios": "^1.6.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.50.0",
    "react-router-dom": "^6.22.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "@uiw/react-md-editor": "^4.0.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.0"
  }
}
```

**Step 2: 创建配置文件**

`apps/admin/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`apps/admin/tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

`apps/admin/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
```

`apps/admin/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

`apps/admin/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`apps/admin/index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>博客管理后台</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 3: 创建入口文件**

`apps/admin/src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`apps/admin/src/App.tsx`:
```typescript
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold">博客管理后台</h1>
    </div>
  );
}

export default App;
```

`apps/admin/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: 安装依赖**

Run:
```bash
cd apps/admin
pnpm install
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat(admin): initialize Vite + React project"
```

---

### Task 22: 实现管理员登录

**Files:**
- Create: `apps/admin/src/lib/api.ts`
- Create: `apps/admin/src/hooks/useAuth.ts`
- Create: `apps/admin/src/pages/Login.tsx`
- Modify: `apps/admin/src/App.tsx`

**Step 1: 创建 API 客户端**

`apps/admin/src/lib/api.ts`:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// 请求拦截器：添加 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

**Step 2: 创建认证 Hook**

`apps/admin/src/hooks/useAuth.ts`:
```typescript
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface LoginCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/admin/login', credentials);
      localStorage.setItem('admin_token', res.data.data.token);
      localStorage.setItem('admin_username', res.data.data.username);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    window.location.href = '/login';
  }, []);

  const isAuthenticated = !!localStorage.getItem('admin_token');
  const username = localStorage.getItem('admin_username');

  return { login, logout, isAuthenticated, isLoading, error, username };
}
```

**Step 3: 创建登录页面**

`apps/admin/src/pages/Login.tsx`:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">博客管理后台</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 4: 更新 App.tsx 添加路由**

`apps/admin/src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/Login';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>欢迎回来！</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

**Step 5: 测试**

Run:
```bash
pnpm dev
```

访问 http://localhost:3001/login
Expected: 登录页面正常显示

**Step 6: 提交**

```bash
git add .
git commit -m "feat(admin): add admin login page"
```

---

## Phase 5: Docker 部署

### Task 23: 创建 Dockerfile

**Files:**
- Create: `Dockerfile.api`
- Create: `Dockerfile.web`
- Create: `Dockerfile.admin`
- Create: `.dockerignore`

**Step 1: 创建 API Dockerfile**

`Dockerfile.api`:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-utils ./packages/shared-utils
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm --filter @blog/shared-types build
RUN pnpm --filter @blog/shared-utils build

# Build API
WORKDIR /app/apps/api
RUN pnpm db:generate
RUN pnpm build

# Production stage
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.pnpm/@prisma+client* ./apps/api/node_modules/.pnpm/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

EXPOSE 4000

WORKDIR /app/apps/api

CMD ["node", "dist/index.js"]
```

**Step 2: 创建 Web Dockerfile**

`Dockerfile.web`:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-utils ./packages/shared-utils
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @blog/shared-types build
RUN pnpm --filter @blog/shared-utils build
RUN pnpm --filter @blog/web build

# Production stage
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
```

**Step 3: 创建 Admin Dockerfile**

`Dockerfile.admin`:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-utils ./packages/shared-utils
COPY apps/admin ./apps/admin

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @blog/shared-types build
RUN pnpm --filter @blog/shared-utils build
RUN pnpm --filter @blog/admin build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY nginx/admin.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001
```

**Step 4: 创建 .dockerignore**

`.dockerignore`:
```
node_modules
.git
.env
.env.local
.next
dist
build
*.log
.DS_Store
uploads
postgres_data
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat(docker): add Dockerfiles for all services"
```

---

### Task 24: 创建 Docker Compose 配置

**Files:**
- Create: `docker-compose.yml`
- Create: `nginx/nginx.conf`
- Create: `nginx/admin.conf`
- Create: `.env.example`

**Step 1: 创建 docker-compose.yml**

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: blog
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U blog -d blog"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      PORT: 4000
      DATABASE_URL: postgresql://blog:${DB_PASSWORD}@postgres:5432/blog
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      ADMIN_USERNAME: ${ADMIN_USERNAME}
      ADMIN_PASSWORD_HASH: ${ADMIN_PASSWORD_HASH}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
      UPLOAD_DIR: /app/uploads
    volumes:
      - uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    environment:
      PORT: 3000
      API_URL: http://api:4000
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
    depends_on:
      - api

  admin:
    build:
      context: .
      dockerfile: Dockerfile.admin
    depends_on:
      - api

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - uploads:/var/www/uploads
    depends_on:
      - web
      - admin
      - api

volumes:
  postgres_data:
  uploads:
```

**Step 2: 创建 Nginx 配置**

`nginx/nginx.conf`:
```nginx
upstream web {
    server web:3000;
}

upstream admin {
    server admin:3001;
}

upstream api {
    server api:4000;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    # 前端展示端
    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 文章管理端
    location /admin {
        proxy_pass http://admin;
        proxy_set_header Host $host;
    }

    # API 后端
    location /api {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传的文件
    location /uploads {
        alias /var/www/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

`nginx/admin.conf`:
```nginx
server {
    listen 3001;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Step 3: 创建环境变量示例**

`.env.example`:
```bash
# Database
DB_PASSWORD=your_secure_db_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost
NEXTAUTH_SECRET=your_nextauth_secret
```

**Step 4: 提交**

```bash
git add .
git commit -m "feat(docker): add docker-compose and nginx configuration"
```

---

## Phase 6: 收尾工作

### Task 25: 完善 README 和文档

**Files:**
- Modify: `README.md`

**Step 1: 创建 README**

`README.md`:
```markdown
# 博客系统

一个使用 Next.js + React + Fastify + PostgreSQL 构建的全栈博客系统。

## 技术栈

- **前端展示端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **文章管理端**: React 18 + Vite + TypeScript
- **接口后端**: Fastify + Prisma + PostgreSQL
- **部署**: Docker + Docker Compose

## 功能特性

- 文章发布与管理（Markdown 编辑器）
- 分类和标签管理
- 文章 SEO 优化
- GitHub OAuth 评论系统
- 评论审核机制
- 图片上传
- 响应式设计

## 快速开始

### 开发环境

1. 克隆仓库
```bash
git clone <repo-url>
cd blog-system
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件填写必要配置
```

4. 启动 PostgreSQL
```bash
docker run -d --name blog-postgres -e POSTGRES_USER=blog -e POSTGRES_PASSWORD=password -e POSTGRES_DB=blog -p 5432:5432 postgres:16-alpine
```

5. 运行数据库迁移
```bash
pnpm db:migrate
pnpm db:seed
```

6. 启动开发服务器
```bash
# 同时启动所有服务
pnpm dev
```

服务将启动在：
- 前端展示: http://localhost:3000
- 管理后台: http://localhost:3001
- API 接口: http://localhost:4000

### Docker 部署

```bash
# 创建 .env 文件并配置
# 部署
docker-compose up -d
```

访问 http://localhost

## 目录结构

```
blog-system/
├── apps/
│   ├── web/          # 前端展示端 (Next.js)
│   ├── admin/        # 文章管理端 (React + Vite)
│   └── api/          # 接口后端 (Fastify)
├── packages/
│   ├── shared-types/ # 共享类型定义
│   └── shared-utils/ # 共享工具函数
├── docs/plans/       # 设计文档
├── docker-compose.yml
└── README.md
```

## 许可证

MIT
```

**Step 2: 最终提交**

```bash
git add .
git commit -m "docs: add comprehensive README"
```

---

## 总结

本实现计划包含 **25 个任务**，分为 6 个阶段：

| 阶段 | 任务数 | 描述 |
|-----|-------|------|
| Phase 1 | 3 | Monorepo 初始化，共享包创建 |
| Phase 2 | 13 | 后端 API 实现（Fastify + Prisma） |
| Phase 3 | 4 | 前端展示端（Next.js） |
| Phase 4 | 2 | 文章管理端（React + Vite）- 基础 |
| Phase 5 | 2 | Docker 部署配置 |
| Phase 6 | 1 | 文档完善 |

**后续可选扩展：**
- 文章管理端完整功能（文章列表、编辑器、分类/标签管理）
- 评论管理功能
- 文章搜索
- 主题切换
- 访问统计
