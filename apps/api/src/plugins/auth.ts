import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export interface UserPayload {
  userId: number;
  username: string;
  type: 'admin' | 'user';
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async function (app: FastifyInstance) {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{ userId: number; username: string; type: string }>();
      request.user = decoded as UserPayload;
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  app.decorate('authenticateAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{ userId: number; username: string; type: string }>();
      if (decoded.type !== 'admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }
      request.user = decoded as UserPayload;
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
});
