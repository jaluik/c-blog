import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export default fp(async (app: FastifyInstance) => {
  await ensureDir(UPLOAD_DIR);

  app.decorate("uploadFile", async (data: Buffer, filename: string): Promise<string> => {
    const date = new Date();
    const subDir = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dir = path.join(UPLOAD_DIR, subDir);
    await ensureDir(dir);

    const ext = path.extname(filename);
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filepath = path.join(dir, name);

    await fs.writeFile(filepath, data);
    return `/uploads/${subDir}/${name}`;
  });
});

declare module "fastify" {
  interface FastifyInstance {
    uploadFile: (data: Buffer, filename: string) => Promise<string>;
  }
}
