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
