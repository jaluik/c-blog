import type { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";
import { getClientIp, getViewCountConfig, hashIp } from "../../utils/viewCount";

export async function publicPostRoutes(app: FastifyInstance) {
  // 获取文章列表
  app.get("/posts", async (request, _reply) => {
    const {
      page = "1",
      pageSize = "10",
      category,
      tag,
      year,
      month,
    } = request.query as {
      page?: string;
      pageSize?: string;
      category?: string;
      tag?: string;
      year?: string;
      month?: string;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: Prisma.ArticleWhereInput = { status: "published" };

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    // 按时间筛选（年/月）
    if (year) {
      const yearNum = Number(year);
      const monthNum = month ? Number(month) : 0;

      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = month
        ? new Date(yearNum, monthNum, 0, 23, 59, 59)
        : new Date(yearNum + 1, 0, 0, 23, 59, 59);

      where.publishedAt = { gte: startDate, lte: endDate };
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
          _count: { select: { comments: { where: { status: "APPROVED" } } } },
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
        viewCount: p.viewCount,
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
        _count: { select: { comments: { where: { status: "APPROVED" } } } },
      },
    });

    if (!post) {
      return reply.status(404).send({ error: "Article not found" });
    }

    const config = getViewCountConfig();

    // 防刷检查
    if (config.enabled) {
      const clientIp = getClientIp(request);
      const ipHash = hashIp(clientIp);
      const userAgent = request.headers["user-agent"] as string | undefined;

      // 检查最近 24 小时内是否已记录
      const cooldownDate = new Date();
      cooldownDate.setHours(cooldownDate.getHours() - config.cooldownHours);

      const existingLog = await prisma.viewLog.findFirst({
        where: {
          articleId: post.id,
          ipHash,
          viewedAt: { gte: cooldownDate },
        },
      });

      if (!existingLog) {
        // 新访问，增加计数并记录日志
        await prisma.$transaction([
          prisma.article.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
          }),
          prisma.viewLog.create({
            data: {
              articleId: post.id,
              ipHash,
              userAgent,
            },
          }),
          // 清理过期记录
          prisma.viewLog.deleteMany({
            where: {
              articleId: post.id,
              expiresAt: { lt: new Date() },
            },
          }),
        ]);
      }
    } else {
      // 防刷关闭，直接增加计数
      await prisma.article.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    // 重新获取最新的 viewCount（事务可能已更新）
    const updatedPost = await prisma.article.findUnique({
      where: { id: post.id },
      select: { viewCount: true },
    });

    return {
      success: true,
      data: {
        ...post,
        tags: post.tags.map((t) => t.tag),
        commentCount: post._count.comments,
        viewCount: updatedPost?.viewCount ?? post.viewCount,
        _count: undefined,
      },
    };
  });
}
