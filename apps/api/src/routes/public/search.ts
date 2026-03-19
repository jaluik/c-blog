import type { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";
import type { SearchRequest } from "../../types/search";

export async function searchRoutes(app: FastifyInstance) {
  app.post("/search", async (request, reply) => {
    const { q, limit = 10, offset = 0 } = request.body as SearchRequest;

    // Validation
    if (!q || q.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: "搜索关键词不能为空",
      });
    }

    const keyword = q.trim();

    if (keyword.length > 100) {
      return reply.status(400).send({
        success: false,
        error: "搜索关键词过长，最多100个字符",
      });
    }

    try {
      // Set lower similarity threshold for better short keyword matching (especially Chinese)
      await prisma.$executeRawUnsafe(`SET pg_trgm.similarity_threshold = 0.1`);

      // Use pg_trgm for fuzzy search with ILIKE fallback for better Chinese support
      const results = await prisma.$queryRawUnsafe<any[]>(
        `
        SELECT
          a.id,
          a.title,
          a.slug,
          a.summary,
          a.content,
          a."publishedAt",
          a."createdAt",
          a."categoryId",
          c.id as "category.id",
          c.name as "category.name",
          c.slug as "category.slug",
          (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) <-> $1 as similarity
        FROM articles a
        LEFT JOIN categories c ON a."categoryId" = c.id
        WHERE a.status = 'published'
          AND (
            (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) % $1
            OR (a.title || COALESCE(a.summary, '') || a.content) ILIKE '%' || $1 || '%'
          )
        ORDER BY
          (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) <-> $1 ASC,
          a."publishedAt" DESC NULLS LAST
        LIMIT $2 OFFSET $3
      `,
        keyword,
        limit,
        offset,
      );

      // Get total count
      const countResult = await prisma.$queryRawUnsafe<[{ count: number }]>(
        `
        SELECT COUNT(*) as count
        FROM articles a
        WHERE a.status = 'published'
          AND (
            (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) % $1
            OR (a.title || COALESCE(a.summary, '') || a.content) ILIKE '%' || $1 || '%'
          )
      `,
        keyword,
      );

      const total = Number(countResult[0]?.count || 0);

      // Get tags for articles
      const articleIds = results.map((r) => r.id);
      let tags: any[] = [];

      if (articleIds.length > 0) {
        tags = await prisma.$queryRawUnsafe(
          `
          SELECT
            at."articleId" as "articleId",
            t.id as "tagId",
            t.name as "tagName",
            t.slug as "tagSlug"
          FROM article_tags at
          JOIN tags t ON at."tagId" = t.id
          WHERE at."articleId" IN (${articleIds.map((_, i) => `$${i + 1}`).join(", ")})
        `,
          ...articleIds,
        );
      }

      // Format response
      const data = results.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        publishedAt: article.publishedAt?.toISOString() || null,
        category: article["category.id"]
          ? {
              id: article["category.id"],
              name: article["category.name"],
              slug: article["category.slug"],
            }
          : null,
        tags: tags
          .filter((t) => t.articleId === article.id)
          .map((t) => ({
            id: t.tagId,
            name: t.tagName,
            slug: t.tagSlug,
          })),
        similarity: 1 - Number(article.similarity),
      }));

      return {
        success: true,
        data,
        meta: {
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error("Search error:", error);
      return reply.status(500).send({
        success: false,
        error: "搜索服务暂时不可用",
      });
    }
  });
}
