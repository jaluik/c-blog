import { slugify } from "@blog/shared-utils";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../prisma";

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().optional(),
});

export async function adminTagRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticateAdmin);

  app.get("/admin/tags", async () => {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
    return {
      success: true,
      data: tags.map((t) => ({ ...t, articleCount: t._count.articles, _count: undefined })),
    };
  });

  app.post("/admin/tags", async (request, reply) => {
    const body = tagSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Invalid input" });

    const data = body.data;
    const slug = data.slug || slugify(data.name);

    const tag = await prisma.tag.create({
      data: { ...data, slug },
    });
    return { data: tag, message: "Tag created" };
  });

  app.put("/admin/tags/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = tagSchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Invalid input" });

    const tag = await prisma.tag.update({
      where: { id: Number(id) },
      data: body.data,
    });
    return { data: tag, message: "Tag updated" };
  });

  app.delete("/admin/tags/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.tag.delete({ where: { id: Number(id) } });
    return { message: "Tag deleted" };
  });
}
