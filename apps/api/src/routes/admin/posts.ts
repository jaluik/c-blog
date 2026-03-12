import { slugify } from "@blog/shared-utils";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../prisma";

const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().optional(),
  content: z.string().min(1),
  summary: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(["draft", "published"]),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updatePostSchema = createPostSchema.partial();

export async function adminPostRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticateAdmin);

  // 获取文章列表（包含草稿）
  app.get("/admin/posts", async (request) => {
    const {
      page = "1",
      pageSize = "10",
      status,
    } = request.query as {
      page?: string;
      pageSize?: string;
      status?: string;
    };

    const pageNum = Number(page);
    const size = Number(pageSize);
    const skip = (pageNum - 1) * size;

    const where: any = {};
    if (status) where.status = status;

    const [posts, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      data: posts.map((p) => ({
        ...p,
        tags: p.tags.map((t) => t.tag),
        _count: undefined,
      })),
      meta: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    };
  });

  // 获取单篇文章
  app.get("/admin/posts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const post = await prisma.article.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return reply.status(404).send({ error: "Article not found" });
    }

    return { success: true, data: { ...post, tags: post.tags.map((t) => t.tag) } };
  });

  // 创建文章
  app.post("/admin/posts", async (request, reply) => {
    const body = createPostSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: "Invalid input", details: body.error });
    }

    const data = body.data;
    const slug = data.slug || slugify(data.title);

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return reply.status(400).send({ error: "Slug already exists" });
    }

    const post = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        summary: data.summary,
        coverImage: data.coverImage,
        status: data.status,
        categoryId: data.categoryId,
        publishedAt: data.status === "published" ? new Date() : null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        tags: data.tagIds
          ? {
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return { data: post, message: "Article created" };
  });

  // 更新文章
  app.put("/admin/posts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updatePostSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: "Invalid input", details: body.error });
    }

    const data = body.data;
    const existing = await prisma.article.findUnique({ where: { id: Number(id) } });

    if (!existing) {
      return reply.status(404).send({ error: "Article not found" });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.article.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return reply.status(400).send({ error: "Slug already exists" });
      }
    }

    const post = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        summary: data.summary,
        coverImage: data.coverImage,
        status: data.status,
        categoryId: data.categoryId,
        publishedAt:
          data.status === "published" && existing.status === "draft" ? new Date() : undefined,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        tags: data.tagIds
          ? {
              deleteMany: {},
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return { data: post, message: "Article updated" };
  });

  // 删除文章
  app.delete("/admin/posts/:id", async (request, _reply) => {
    const { id } = request.params as { id: string };

    await prisma.article.delete({
      where: { id: Number(id) },
    });

    return { message: "Article deleted" };
  });
}
