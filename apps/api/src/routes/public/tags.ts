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
