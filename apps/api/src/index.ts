import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { publicPostRoutes } from './routes/public/posts';
import { categoryRoutes } from './routes/public/categories';
import { tagRoutes } from './routes/public/tags';
import { commentRoutes } from './routes/public/comments';

const app = fastify({ logger: true });

const start = async () => {
  try {
    // 注册 CORS
    await app.register(cors, {
      origin: true,
      credentials: true,
    });

    // 健康检查
    app.get('/health', async () => ({ status: 'ok' }));

    // 公开路由
    await app.register(publicPostRoutes, { prefix: '/api' });
    await app.register(categoryRoutes, { prefix: '/api' });
    await app.register(tagRoutes, { prefix: '/api' });
    await app.register(commentRoutes, { prefix: '/api' });

    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
