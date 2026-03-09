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
    const { articleId, articleSlug } = request.query as { articleId?: string; articleSlug?: string };

    if (!articleId && !articleSlug) {
      return reply.status(400).send({ error: 'articleId or articleSlug is required' });
    }

    let actualArticleId: number;

    if (articleId) {
      actualArticleId = Number(articleId);
    } else {
      // Look up article by slug
      const article = await prisma.article.findUnique({
        where: { slug: articleSlug },
        select: { id: true },
      });

      if (!article) {
        return reply.status(404).send({ error: 'Article not found' });
      }

      actualArticleId = article.id;
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId: actualArticleId,
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
}
