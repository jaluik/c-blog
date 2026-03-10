import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../prisma";
import { verifyPassword } from "../../utils/password";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function adminAuthRoutes(app: FastifyInstance) {
  app.post("/auth/admin/login", async (request, reply) => {
    const body = loginSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: "Invalid input" });
    }

    const { username, password } = body.data;

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = app.jwt.sign({
      userId: admin.id,
      username: admin.username,
      type: "admin",
    });

    return { success: true, data: { token, username: admin.username } };
  });
}
