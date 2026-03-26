-- CreateTable
CREATE TABLE "view_logs" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

    CONSTRAINT "view_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "view_logs_articleId_ipHash_idx" ON "view_logs"("articleId", "ipHash");

-- CreateIndex
CREATE INDEX "view_logs_expiresAt_idx" ON "view_logs"("expiresAt");
