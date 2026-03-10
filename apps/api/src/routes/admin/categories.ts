import { slugify } from "@blog/shared-utils";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../prisma";

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function adminCategoryRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticateAdmin);

  app.get("/admin/categories", async () => {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { articles: true } } },
    });
    return {
      success: true,
      data: categories.map((c) => ({ ...c, articleCount: c._count.articles, _count: undefined })),
    };
  });

  app.post("/admin/categories", async (request, reply) => {
    const body = categorySchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Invalid input" });

    const data = body.data;
    const slug = data.slug || slugify(data.name);

    const category = await prisma.category.create({
      data: { ...data, slug },
    });
    return { data: category, message: "Category created" };
  });

  app.put("/admin/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = categorySchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Invalid input" });

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: body.data,
    });
    return { data: category, message: "Category updated" };
  });

  app.delete("/admin/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.category.delete({ where: { id: Number(id) } });
    return { message: "Category deleted" };
  });
}
