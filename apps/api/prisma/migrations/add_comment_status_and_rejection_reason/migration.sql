-- 创建 CommentStatus 枚举类型
CREATE TYPE "comment_status" AS ENUM ('pending', 'approved', 'rejected');

-- 添加新列（允许NULL）
ALTER TABLE "comments" ADD COLUMN "status" "comment_status";
ALTER TABLE "comments" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "comments" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- 迁移现有数据：isApproved = true -> status = 'approved', isApproved = false -> status = 'pending'
UPDATE "comments" SET "status" = CASE WHEN "isApproved" = true THEN 'approved'::"comment_status" ELSE 'pending'::"comment_status" END;

-- 设置 updatedAt 为当前时间
UPDATE "comments" SET "updatedAt" = NOW();

-- 修改列约束
ALTER TABLE "comments" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "comments" ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "comments" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "comments" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- 删除旧列
ALTER TABLE "comments" DROP COLUMN "isApproved";

-- 创建新索引
CREATE INDEX "comments_articleId_status_idx" ON "comments"("articleId", "status");

-- 删除旧索引
DROP INDEX IF EXISTS "comments_articleId_isApproved_idx";
