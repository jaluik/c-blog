import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import path from 'path';
import { publicPostRoutes } from './routes/public/posts';
import { categoryRoutes } from './routes/public/categories';
import { tagRoutes } from './routes/public/tags';
import { commentRoutes } from './routes/public/comments';
import { adminAuthRoutes } from './routes/auth/admin';
import authPlugin from './plugins/auth';
import storagePlugin from './plugins/storage';
import { adminPostRoutes } from './routes/admin/posts';
import { adminCategoryRoutes } from './routes/admin/categories';
import { adminTagRoutes } from './routes/admin/tags';
import { adminCommentRoutes } from './routes/admin/comments';
import { uploadRoutes } from './routes/admin/upload';

const app = fastify({ logger: true });

const start = async () => {
  try {
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

    // 注册认证插件
    await app.register(authPlugin);

    // 注册 multipart 插件
    await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

    // 注册存储插件
    await app.register(storagePlugin);

    // 静态文件服务
    await app.register(staticPlugin, {
      root: path.join(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
      prefix: '/uploads/',
    });

    // 健康检查
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
    await app.register(adminCategoryRoutes, { prefix: '/api' });
    await app.register(adminTagRoutes, { prefix: '/api' });
    await app.register(adminCommentRoutes, { prefix: '/api' });
    await app.register(uploadRoutes, { prefix: '/api' });

    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
