import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const githubCallbackSchema = z.object({
  code: z.string(),
});

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
}

export async function githubAuthRoutes(app: FastifyInstance) {
  app.post('/auth/github', async (request, reply) => {
    const body = githubCallbackSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const { code } = body.data;

    try {
      // 用 code 换 access_token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenRes.json() as { error?: string; error_description?: string; access_token?: string };

      if (tokenData.error) {
        return reply.status(400).send({ error: tokenData.error_description });
      }

      // 获取用户信息
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const user = await userRes.json() as GitHubUser;

      // 生成 JWT
      const token = app.jwt.sign({
        userId: user.id,
        username: user.login,
        avatar: user.avatar_url,
        type: 'user',
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
      console.error('GitHub OAuth error:', err);
      return reply.status(500).send({ error: 'OAuth failed' });
    }
  });
}
