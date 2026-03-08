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

  // 发表评论（需要 JWT - 暂时留空，等 Task 11 完成）
  app.post('/comments', async (request, reply) => {
    const body = createCommentSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input', details: body.error });
    }

    // TODO: 从 JWT 获取用户信息（Task 11 实现）
    return reply.status(501).send({ error: 'Not implemented yet' });
  });
}
