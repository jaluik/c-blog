import type { FastifyInstance } from "fastify";
import { z } from "zod";

const githubCallbackSchema = z.object({
  access_token: z.string(),
});

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
}

export async function githubAuthRoutes(app: FastifyInstance) {
  app.post("/auth/github", async (request, reply) => {
    const body = githubCallbackSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Invalid input" });
    }

    const { access_token } = body.data;

    try {
      // 使用 access_token 直接获取用户信息
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!userRes.ok) {
        return reply.status(400).send({ error: "Invalid access token" });
      }

      const user = (await userRes.json()) as GitHubUser;

      // 生成 JWT
      const token = app.jwt.sign({
        userId: user.id,
        username: user.login,
        avatar: user.avatar_url,
        type: "user",
      });

      return {
        data: {
          token,
          user: {
            id: user.id,
            username: user.login,
            avatar: user.avatar_url,
          },
        },
      };
    } catch (err) {
      console.error("GitHub OAuth error:", err);
      return reply.status(500).send({ error: "OAuth failed" });
    }
  });
}
