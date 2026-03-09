import type { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/categories", async () => {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { articles: { where: { status: "published" } } } },
      },
    });

    return {
      data: categories.map((c) => ({
        ...c,
        articleCount: c._count.articles,
        _count: undefined,
      })),
    };
  });
}
