import { authOptions } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { articleSlug } = req.query;

  if (!articleSlug || typeof articleSlug !== "string") {
    return res.status(400).json({ error: "articleSlug is required" });
  }

  const session = await getServerSession(req, res, authOptions);
  const backendToken = (session as any)?.backendToken;

  try {
    const API_URL = process.env.API_URL || "http://localhost:4000";

    // 构建请求头，如果有 token 则带上
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (backendToken) {
      headers.Authorization = `Bearer ${backendToken}`;
    }

    const response = await fetch(
      `${API_URL}/api/comments?articleSlug=${encodeURIComponent(articleSlug)}`,
      { headers },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Fetch comments error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
