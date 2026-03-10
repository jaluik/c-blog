import type { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";

export async function publicPostRoutes(app: FastifyInstance) {
  // 获取文章列表
  app.get("/posts", async (request, reply) => {
    const {
      page = "1",
      pageSize = "10",
      category,
      tag,
    } = request.query as {
      page?: string;
      pageSize?: string;
      category?: string;
      tag?: string;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: any = { status: "published" };

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
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
          _count: { select: { comments: { where: { isApproved: true } } } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      success: true,
      data: posts.map((p) => ({
        ...p,
        tags: p.tags.map((t) => t.tag),
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
  app.get("/posts/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const post = await prisma.article.findUnique({
      where: { slug, status: "published" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { comments: { where: { isApproved: true } } } },
      },
    });

    if (!post) {
      return reply.status(404).send({ error: "Article not found" });
    }

    // 增加浏览量
    await prisma.article.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      success: true,
      data: {
        ...post,
        tags: post.tags.map((t) => t.tag),
        commentCount: post._count.comments,
        _count: undefined,
      },
    };
  });
}
