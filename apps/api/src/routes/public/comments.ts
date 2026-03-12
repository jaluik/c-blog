import type { CommentStatus } from "@blog/shared-types";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../prisma";

const createCommentSchema = z.object({
  articleId: z.number(),
  parentId: z.number().optional(),
  content: z.string().min(1).max(5000),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// Prisma 使用的枚举值（大写）
const PrismaCommentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export async function commentRoutes(app: FastifyInstance) {
  // 获取文章评论（已通过 + 当前用户自己的待审核和拒绝评论）
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
      // 用户未登录，只返回已通过评论
    }

    // 构建查询条件：已通过的，或者当前用户自己的待审核/拒绝评论
    const whereCondition: any = {
      articleId: actualArticleId,
      parentId: null,
      OR: [{ status: PrismaCommentStatus.APPROVED }],
    };

    // 如果用户已登录，也包含该用户的待审核和拒绝评论
    if (currentUserId) {
      whereCondition.OR.push({
        status: { in: [PrismaCommentStatus.PENDING, PrismaCommentStatus.REJECTED] },
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
              { status: PrismaCommentStatus.APPROVED },
              ...(currentUserId
                ? [
                    {
                      status: { in: [PrismaCommentStatus.PENDING, PrismaCommentStatus.REJECTED] },
                      githubUserId: currentUserId,
                    },
                  ]
                : []),
            ],
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return { success: true, data: comments };
  });

  // 获取当前用户的所有评论（用于用户中心）
  app.get(
    "/comments/my",
    {
      onRequest: [app.authenticate],
    },
    async (request) => {
      const user = request.user;
      const { status } = request.query as { status?: CommentStatus };

      const where: any = {
        githubUserId: String(user.userId),
      };

      if (status) {
        where.status = status.toUpperCase();
      }

      const comments = await prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          article: {
            select: { id: true, title: true, slug: true },
          },
        },
      });

      return { success: true, data: comments };
    },
  );

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
          status: PrismaCommentStatus.PENDING,
        },
      });

      return { data: comment, message: "Comment submitted for moderation" };
    },
  );

  // 更新自己的评论（需要 JWT）
  app.patch(
    "/comments/:id",
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateCommentSchema.safeParse(request.body);
      const user = request.user;

      if (!body.success) {
        return reply.status(400).send({ error: "Invalid input", details: body.error });
      }

      // 检查评论是否存在且属于当前用户
      const existingComment = await prisma.comment.findUnique({
        where: { id: Number(id) },
      });

      if (!existingComment) {
        return reply.status(404).send({ error: "Comment not found" });
      }

      if (existingComment.githubUserId !== String(user.userId)) {
        return reply.status(403).send({ error: "Can only update your own comments" });
      }

      // 被拒绝的评论可以修改后重新进入待审核状态
      const updateData: any = {
        content: body.data.content,
      };

      // 如果被拒绝了，修改后重新进入待审核状态
      if (existingComment.status === PrismaCommentStatus.REJECTED) {
        updateData.status = PrismaCommentStatus.PENDING;
        updateData.rejectionReason = null;
      }

      const comment = await prisma.comment.update({
        where: { id: Number(id) },
        data: updateData,
      });

      return { data: comment, message: "Comment updated successfully" };
    },
  );

  // 删除自己的评论（需要 JWT）
  app.delete(
    "/comments/:id",
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user;

      // 检查评论是否存在且属于当前用户
      const existingComment = await prisma.comment.findUnique({
        where: { id: Number(id) },
      });

      if (!existingComment) {
        return reply.status(404).send({ error: "Comment not found" });
      }

      if (existingComment.githubUserId !== String(user.userId)) {
        return reply.status(403).send({ error: "Can only delete your own comments" });
      }

      await prisma.comment.delete({ where: { id: Number(id) } });

      return { message: "Comment deleted successfully" };
    },
  );
}
