import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../prisma";

const createCommentSchema = z.object({
  articleId: z.number(),
  parentId: z.number().optional(),
  content: z.string().min(1).max(5000),
});

export async function commentRoutes(app: FastifyInstance) {
  // 获取文章评论（已审核的 + 当前用户自己的待审核评论）
  app.get("/comments", async (request, reply) => {
    const { articleId, articleSlug } = request.query as {
      articleId?: string;
      articleSlug?: string;
    };

    if (!articleId && !articleSlug) {
      return reply.status(400).send({ error: "articleId or articleSlug is required" });
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
        return reply.status(404).send({ error: "Article not found" });
      }

      actualArticleId = article.id;
    }

    // 尝试获取当前用户（可选认证）
    let currentUserId: string | undefined;
    try {
      const decoded = await request.jwtVerify<{ userId: number; username: string; type: string }>();
      currentUserId = String(decoded.userId);
    } catch {
      // 用户未登录，只返回已审核评论
    }

    // 构建查询条件：已审核的，或者当前用户自己的待审核评论
    const whereCondition: any = {
      articleId: actualArticleId,
      parentId: null,
      OR: [{ isApproved: true }],
    };

    // 如果用户已登录，也包含该用户的待审核评论
    if (currentUserId) {
      whereCondition.OR.push({
        isApproved: false,
        githubUserId: currentUserId,
      });
    }

    const comments = await prisma.comment.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          where: {
            OR: [
              { isApproved: true },
              ...(currentUserId ? [{ isApproved: false, githubUserId: currentUserId }] : []),
            ],
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return { success: true, data: comments };
  });

  // 发表评论（需要 JWT）
  app.post(
    "/comments",
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const body = createCommentSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({ error: "Invalid input", details: body.error });
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

      return { data: comment, message: "Comment submitted for moderation" };
    },
  );
}
