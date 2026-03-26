import crypto from "crypto";

const COOLDOWN_HOURS = parseInt(process.env.VIEW_COOLDOWN_HOURS || "24");
const DEDUPLICATION_ENABLED = process.env.VIEW_DEDUPLICATION_ENABLED !== "false";

/**
 * 计算 IP 哈希值
 */
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * 从请求中获取真实 IP
 */
export function getClientIp(request: {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}): string {
  const forwarded = request.headers["x-forwarded-for"];
  const realIp = request.headers["x-real-ip"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  if (typeof realIp === "string") {
    return realIp;
  }

  return request.ip || "unknown";
}

/**
 * 获取防刷配置
 */
export function getViewCountConfig() {
  return {
    cooldownHours: COOLDOWN_HOURS,
    enabled: DEDUPLICATION_ENABLED,
  };
}
