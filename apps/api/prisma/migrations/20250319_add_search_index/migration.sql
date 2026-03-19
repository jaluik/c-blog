-- 启用 pg_trgm 扩展
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 创建搜索 GIN 索引（支持模糊匹配）
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles
USING GIN ((title || ' ' || COALESCE(summary, '') || ' ' || content) gin_trgm_ops);
