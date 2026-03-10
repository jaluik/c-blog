import type { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";

export async function adminCommentRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticateAdmin);

  // 获取评论列表（包含待审核）
  app.get("/admin/comments", async (request) => {
    const {
      page = "1",
      pageSize = "20",
      articleId,
      isApproved,
    } = request.query as {
      page?: string;
      pageSize?: string;
      articleId?: string;
      isApproved?: string;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: any = {};
    if (articleId) where.articleId = Number(articleId);
    if (isApproved !== undefined) where.isApproved = isApproved === "true";

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
      data: comments,
      meta: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    };
  });

  // 审核评论
  app.patch("/admin/comments/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { isApproved } = request.body as { isApproved: boolean };

    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { isApproved },
    });

    return { data: comment, message: `Comment ${isApproved ? "approved" : "rejected"}` };
  });

  // 删除评论
  app.delete("/admin/comments/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.comment.delete({ where: { id: Number(id) } });
    return { message: "Comment deleted" };
  });
}
