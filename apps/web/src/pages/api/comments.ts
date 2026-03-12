import { authOptions } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const backendToken = (session as any).backendToken;

  if (!backendToken) {
    return res.status(401).json({ error: "No backend token" });
  }

  const { id } = req.query;
  const API_URL = process.env.API_URL || "http://localhost:4000";

  try {
    // POST - 创建评论
    if (req.method === "POST") {
      const response = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    }

    // PATCH - 更新评论
    if (req.method === "PATCH") {
      if (!id) {
        return res.status(400).json({ error: "Comment ID is required" });
      }

      const response = await fetch(`${API_URL}/api/comments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    }

    // DELETE - 删除评论
    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ error: "Comment ID is required" });
      }

      const response = await fetch(`${API_URL}/api/comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${backendToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Comment API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
