import type { CommentStatus } from "@blog/shared-types";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../prisma";

const moderateSchema = z.object({
  status: z.enum(["approved", "rejected", "pending"]),
  rejectionReason: z.string().max(500).optional().nullable(),
});

// Prisma 使用的枚举值（大写）
const PrismaCommentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

type PrismaCommentStatusType = (typeof PrismaCommentStatus)[keyof typeof PrismaCommentStatus];

// 将 Prisma 大写状态转换为前端小写状态
function toFrontendStatus(status: string): CommentStatus {
  return status.toLowerCase() as CommentStatus;
}

// 转换评论数据，将状态值转为小写
function transformComment(comment: any) {
  return {
    ...comment,
    status: toFrontendStatus(comment.status),
  };
}

export async function adminCommentRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticateAdmin);

  // 获取评论列表（包含待审核）
  app.get("/admin/comments", async (request) => {
    const {
      page = "1",
      pageSize = "20",
      articleId,
      status,
    } = request.query as {
      page?: string;
      pageSize?: string;
      articleId?: string;
      status?: CommentStatus;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: any = {};
    if (articleId) where.articleId = Number(articleId);
    if (status)
      where.status = PrismaCommentStatus[
        status.toUpperCase() as keyof typeof PrismaCommentStatus
      ] as PrismaCommentStatusType;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: "desc" },
        include: {
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      success: true,
      data: comments.map(transformComment),
      meta: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    };
  });

  // 审核评论（支持通过/拒绝/重置为待审核）
  app.patch("/admin/comments/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = moderateSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: "Invalid input", details: body.error });
    }

    const { status, rejectionReason } = body.data;

    // 如果状态是 rejected，但没有提供拒绝原因，返回错误
    if (status === "rejected" && !rejectionReason?.trim()) {
      return reply
        .status(400)
        .send({ error: "Rejection reason is required when rejecting a comment" });
    }

    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data: {
        status: PrismaCommentStatus[
          status.toUpperCase() as keyof typeof PrismaCommentStatus
        ] as PrismaCommentStatusType,
        // 如果状态不是 rejected，清空拒绝原因
        rejectionReason: status === "rejected" ? rejectionReason : null,
      },
    });

    const statusMessages: Record<CommentStatus, string> = {
      approved: "已通过",
      rejected: "已拒绝",
      pending: "已重置为待审核",
    };

    return {
      success: true,
      data: transformComment(comment),
      message: `Comment ${statusMessages[status]}`,
    };
  });

  // 删除评论
  app.delete("/admin/comments/:id", async (request, _reply) => {
    const { id } = request.params as { id: string };
    await prisma.comment.delete({ where: { id: Number(id) } });
    return { message: "Comment deleted" };
  });
}
