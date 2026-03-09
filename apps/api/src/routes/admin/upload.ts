import type { FastifyInstance } from "fastify";

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticateAdmin);

  app.post("/admin/upload", async (request, reply) => {
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === "file") {
        const buffer = await part.toBuffer();
        const filename = part.filename;

        // 验证文件类型
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(part.mimetype)) {
          return reply.status(400).send({ error: "Invalid file type" });
        }

        // 验证文件大小 (5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          return reply.status(400).send({ error: "File too large (max 5MB)" });
        }

        const url = await app.uploadFile(buffer, filename);
        return { data: { url }, message: "File uploaded" };
      }
    }

    return reply.status(400).send({ error: "No file provided" });
  });
}
