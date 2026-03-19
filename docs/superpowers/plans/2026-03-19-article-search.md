# 文章搜索功能实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的文章搜索功能，包括后端 pg_trgm 搜索 API、前端 Cmd+K 搜索弹窗和搜索结果页

**Architecture:** 使用 PostgreSQL pg_trgm 扩展实现中文模糊搜索，Fastify 提供 /api/search 接口，Next.js 前端实现搜索弹窗（Cmd+K）和结果页

**Tech Stack:** PostgreSQL + pg_trgm, Fastify, Prisma, Next.js, React, TypeScript, Tailwind CSS

**Design Doc:** [2026-03-19-article-search-design.md](../specs/2026-03-19-article-search-design.md)

---

## 文件结构

### 后端 (apps/api)
```
src/
├── routes/
│   └── public/
│       └── search.ts          # 搜索 API 端点 (NEW)
├── types/
│   └── search.ts              # 搜索相关类型 (NEW)
└── index.ts                   # 注册搜索路由 (MODIFY)
prisma/
└── migrations/
    └── 20250319_add_search_index/  # 添加 pg_trgm 索引 (NEW)
        └── migration.sql
```

### 前端 (apps/web)
```
src/
├── components/
│   └── search/
│       ├── SearchModal.tsx       # 搜索弹窗组件 (NEW)
│       ├── SearchInput.tsx       # 搜索输入框 (NEW)
│       ├── SearchResultItem.tsx  # 搜索结果项 (NEW)
│       └── useSearch.ts          # 搜索逻辑 Hook (NEW)
├── pages/
│   └── search.tsx                # 搜索结果页 (NEW)
├── lib/
│   └── api.ts                    # 添加 search API (MODIFY)
├── hooks/
│   └── useKeyboardShortcut.ts    # 键盘快捷键 Hook (NEW)
└── styles/
    └── globals.css               # 添加搜索高亮样式 (MODIFY)
```

---

## Chunk 1: 后端基础 - 数据库索引和类型定义

### Task 1: 创建数据库迁移 - 添加 pg_trgm 索引

**Files:**
- Create: `apps/api/prisma/migrations/20250319_add_search_index/migration.sql`

- [ ] **Step 1: 创建迁移文件**

```sql
-- 启用 pg_trgm 扩展
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 创建搜索 GIN 索引（支持模糊匹配）
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles
USING GIN ((title || ' ' || COALESCE(summary, '') || ' ' || content) gin_trgm_ops);
```

- [ ] **Step 2: 应用迁移**

Run:
```bash
cd /Users/jaluik/Github/mine/c-blog/apps/api && npx prisma migrate dev --name add_search_index
```
Expected: 迁移成功，提示 "The following migration(s) have been applied..."

- [ ] **Step 3: 验证索引创建**

Run:
```bash
cd /Users/jaluik/Github/mine/c-blog/apps/api && npx prisma db execute --file ./prisma/migrations/20250319_add_search_index/migration.sql
```
Expected: 执行成功，无错误

- [ ] **Step 4: Commit**

```bash
git add apps/api/prisma/migrations/
git commit -m "feat(db): 添加 pg_trgm 搜索索引"
```

---

### Task 2: 创建搜索类型定义

**Files:**
- Create: `apps/api/src/types/search.ts`
- Modify: `packages/shared-types/src/index.ts` (导出共享类型)

- [ ] **Step 1: 创建后端搜索类型**

```typescript
// apps/api/src/types/search.ts
export interface SearchRequest {
  q: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  publishedAt: Date | null;
  createdAt: Date;
  categoryId: number | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  similarity: number;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

- [ ] **Step 2: 创建共享类型（前端共用）**

```typescript
// packages/shared-types/src/search.ts
export interface SearchPost {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  publishedAt: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  similarity: number;
}

export interface SearchResponse {
  success: boolean;
  data: SearchPost[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SearchRequest {
  q: string;
  limit?: number;
  offset?: number;
}
```

- [ ] **Step 3: 导出共享类型**

Modify `packages/shared-types/src/index.ts`:
```typescript
// 添加导出
export * from "./search";
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/types/search.ts packages/shared-types/src/search.ts packages/shared-types/src/index.ts
git commit -m "feat(types): 添加搜索相关类型定义"
```

---

## Chunk 2: 后端 API - 搜索接口实现

### Task 3: 实现搜索 API 路由

**Files:**
- Create: `apps/api/src/routes/public/search.ts`

- [ ] **Step 1: 创建搜索路由文件**

```typescript
// apps/api/src/routes/public/search.ts
import type { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";
import type { SearchRequest, SearchResult } from "../../types/search";

export async function searchRoutes(app: FastifyInstance) {
  // POST /api/search
  app.post("/search", async (request, reply) => {
    const { q, limit = 10, offset = 0 } = request.body as SearchRequest;

    // 参数校验
    if (!q || q.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: "搜索关键词不能为空",
      });
    }

    const keyword = q.trim();

    // 限制长度
    if (keyword.length > 100) {
      return reply.status(400).send({
        success: false,
        error: "搜索关键词过长，最多100个字符",
      });
    }

    try {
      // 使用 pg_trgm 进行模糊搜索
      // <-> 操作符计算相似度（越小越相似）
      // % 操作符判断相似（相似度 > pg_trgm.similarity_threshold，默认 0.3）
      const results = await prisma.$queryRawUnsafe<SearchResult[]>(`
        SELECT
          a.id,
          a.title,
          a.slug,
          a.summary,
          a.content,
          a."publishedAt",
          a."createdAt",
          a."categoryId",
          c.id as "category.id",
          c.name as "category.name",
          c.slug as "category.slug",
          (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) <-> $1 as similarity
        FROM articles a
        LEFT JOIN categories c ON a."categoryId" = c.id
        WHERE a.status = 'published'
          AND (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) % $1
        ORDER BY
          (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) <-> $1 ASC,
          a."publishedAt" DESC NULLS LAST
        LIMIT $2 OFFSET $3
      `, keyword, limit, offset);

      // 获取总数
      const countResult = await prisma.$queryRawUnsafe<[{ count: number }]>(`
        SELECT COUNT(*) as count
        FROM articles a
        WHERE a.status = 'published'
          AND (a.title || ' ' || COALESCE(a.summary, '') || ' ' || a.content) % $1
      `, keyword);

      const total = Number(countResult[0]?.count || 0);

      // 查询标签
      const articleIds = results.map((r) => r.id);
      let tags: Array<{
        articleId: number;
        tagId: number;
        tagName: string;
        tagSlug: string;
      }> = [];

      if (articleIds.length > 0) {
        tags = await prisma.$queryRawUnsafe(
          `
          SELECT
            at."articleId" as "articleId",
            t.id as "tagId",
            t.name as "tagName",
            t.slug as "tagSlug"
          FROM article_tags at
          JOIN tags t ON at."tagId" = t.id
          WHERE at."articleId" IN (${articleIds.map((_, i) => `$${i + 1}`).join(", ")})
        `,
          ...articleIds,
        );
      }

      // 组装结果
      const data = results.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        publishedAt: article.publishedAt?.toISOString() || null,
        category: article["category.id"]
          ? {
              id: article["category.id"],
              name: article["category.name"],
              slug: article["category.slug"],
            }
          : null,
        tags: tags
          .filter((t) => t.articleId === article.id)
          .map((t) => ({
            id: t.tagId,
            name: t.tagName,
            slug: t.tagSlug,
          })),
        similarity: 1 - Number(article.similarity), // 转换为 0-1，越大越相似
      }));

      return {
        success: true,
        data,
        meta: {
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error("Search error:", error);
      return reply.status(500).send({
        success: false,
        error: "搜索服务暂时不可用",
      });
    }
  });
}
```

- [ ] **Step 2: 类型声明扩展（修复类型错误）**

Create `apps/api/src/types/prisma-extensions.ts`:
```typescript
// 扩展 SearchResult 类型以包含联表查询的字段
export interface SearchResultWithJoins {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  publishedAt: Date | null;
  createdAt: Date;
  categoryId: number | null;
  "category.id"?: number;
  "category.name"?: string;
  "category.slug"?: string;
  similarity: number;
}
```

- [ ] **Step 3: 注册路由**

Modify `apps/api/src/index.ts` (在注册其他路由的位置添加):
```typescript
// 导入
import { searchRoutes } from "./routes/public/search";

// 在 registerRoutes 函数中添加
await app.register(searchRoutes, { prefix: "/api" });
```

- [ ] **Step 4: 运行 API 测试**

Run:
```bash
cd /Users/jaluik/Github/mine/c-blog && pnpm --filter @blog/api dev
```

In another terminal:
```bash
curl -X POST http://localhost:4000/api/search \
  -H "Content-Type: application/json" \
  -d '{"q": "前端", "limit": 5}'
```
Expected: 返回搜索结果 JSON，success: true

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/routes/public/search.ts apps/api/src/types/prisma-extensions.ts apps/api/src/index.ts
git commit -m "feat(api): 实现文章搜索接口"
```

---

## Chunk 3: 前端基础 - API 和 Hook

### Task 4: 前端 API 封装

**Files:**
- Modify: `apps/web/src/lib/api.ts`

- [ ] **Step 1: 添加搜索 API 方法**

```typescript
// 在 apps/web/src/lib/api.ts 中添加
import type { SearchRequest, SearchResponse } from "@blog/shared-types";

export const api = {
  // ... 现有方法

  search: {
    search: (params: SearchRequest) => {
      const { q, limit = 10, offset = 0 } = params;
      return fetchApi<SearchResponse>("/search", {
        method: "POST",
        body: JSON.stringify({ q, limit, offset }),
      });
    },
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/api.ts
git commit -m "feat(web): 添加搜索 API 封装"
```

---

### Task 5: 创建 useSearch Hook

**Files:**
- Create: `apps/web/src/components/search/useSearch.ts`

- [ ] **Step 1: 实现搜索 Hook**

```typescript
// apps/web/src/components/search/useSearch.ts
import type { SearchPost } from "@blog/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface UseSearchOptions {
  debounceMs?: number;
  limit?: number;
}

interface UseSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: SearchPost[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const { debounceMs = 200, limit = 10 } = options;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 清空结果
      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        setError(null);
        return;
      }

      // 创建新的 abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await api.search.search({
          q: searchQuery.trim(),
          limit,
        });

        if (response.success) {
          setResults(response.data);
          setTotal(response.meta.total);
        } else {
          setError("搜索失败");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // 请求被取消，忽略错误
          return;
        }
        setError("搜索服务暂时不可用");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的防抖定时器
    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs, performSearch]);

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    total,
    hasMore: results.length < total,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/search/useSearch.ts
git commit -m "feat(web): 添加 useSearch Hook"
```

---

### Task 6: 创建键盘快捷键 Hook

**Files:**
- Create: `apps/web/src/hooks/useKeyboardShortcut.ts`

- [ ] **Step 1: 实现快捷键 Hook**

```typescript
// apps/web/src/hooks/useKeyboardShortcut.ts
import { useEffect } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(config: ShortcutConfig) {
  const { key, ctrl, meta, shift, alt, callback, preventDefault = true } = config;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrl === undefined || event.ctrlKey === ctrl;
      const metaMatch = meta === undefined || event.metaKey === meta;
      const shiftMatch = shift === undefined || event.shiftKey === shift;
      const altMatch = alt === undefined || event.altKey === alt;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, ctrl, meta, shift, alt, callback, preventDefault]);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/hooks/useKeyboardShortcut.ts
git commit -m "feat(web): 添加键盘快捷键 Hook"
```

---

## Chunk 4: 前端组件 - 搜索结果项和输入框

### Task 7: 创建搜索结果项组件

**Files:**
- Create: `apps/web/src/components/search/SearchResultItem.tsx`

- [ ] **Step 1: 实现搜索结果项**

```tsx
// apps/web/src/components/search/SearchResultItem.tsx
import type { SearchPost } from "@blog/shared-types";
import { Calendar, Folder } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface SearchResultItemProps {
  post: SearchPost;
  keyword: string;
  selected?: boolean;
  onClick?: () => void;
}

export function SearchResultItem({
  post,
  keyword,
  selected = false,
  onClick,
}: SearchResultItemProps) {
  // 高亮匹配文本
  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;

    const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-neon-cyan/30 text-neon-cyan rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  // 转义正则特殊字符
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // 生成摘要片段（优先包含关键词的部分）
  const excerpt = useMemo(() => {
    const text = post.summary || "";
    if (!keyword.trim() || !text) return text;

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);

    if (index === -1) {
      // 没有直接匹配，返回前 100 字符
      return text.slice(0, 100) + (text.length > 100 ? "..." : "");
    }

    // 找到匹配位置，前后各扩展 50 字符
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < text.length ? "..." : "";

    return prefix + text.slice(start, end) + suffix;
  }, [post.summary, keyword]);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/posts/${post.slug}`}
      onClick={onClick}
      className={`block p-4 rounded-xl transition-all duration-200 ${
        selected
          ? "bg-neon-cyan/10 border border-neon-cyan/50"
          : "hover:bg-text-primary/5 border border-transparent"
      }`}
    >
      <h3 className="font-medium text-text-primary mb-2">
        {highlightText(post.title, keyword)}
      </h3>

      {excerpt && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {highlightText(excerpt, keyword)}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-text-tertiary">
        {formattedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        )}
        {post.category && (
          <span className="flex items-center gap-1">
            <Folder className="w-3 h-3" />
            {post.category.name}
          </span>
        )}
        {post.tags.length > 0 && (
          <span className="flex items-center gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 rounded bg-text-primary/5"
              >
                {tag.name}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span>+{post.tags.length - 2}</span>
            )}
          </span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/search/SearchResultItem.tsx
git commit -m "feat(web): 添加搜索结果项组件"
```

---

### Task 8: 创建搜索输入框组件

**Files:**
- Create: `apps/web/src/components/search/SearchInput.tsx`

- [ ] **Step 1: 实现搜索输入框**

```tsx
// apps/web/src/components/search/SearchInput.tsx
import { Search, X } from "lucide-react";
import { forwardRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  autoFocus?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { value, onChange, placeholder = "搜索文章...", loading = false, autoFocus = true },
    ref,
  ) => {
    return (
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
          {loading ? (
            <div className="w-5 h-5 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-10 py-4 bg-transparent text-text-primary placeholder:text-text-tertiary text-lg outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-text-primary/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/search/SearchInput.tsx
git commit -m "feat(web): 添加搜索输入框组件"
```

---

## Chunk 5: 前端组件 - 搜索弹窗

### Task 9: 创建搜索弹窗组件

**Files:**
- Create: `apps/web/src/components/search/SearchModal.tsx`

- [ ] **Step 1: 实现搜索弹窗**

```tsx
// apps/web/src/components/search/SearchModal.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileSearch, Keyboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SearchInput } from "./SearchInput";
import { SearchResultItem } from "./SearchResultItem";
import { useSearch } from "./useSearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { query, setQuery, results, loading, error, total } = useSearch({
    limit: 5,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 重置选中索引当结果变化
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            onClose();
            // 导航由 Link 组件处理
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-bg-secondary/90 backdrop-blur-xl rounded-2xl border border-border-subtle shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Input */}
            <div className="border-b border-border-subtle">
              <SearchInput
                ref={inputRef}
                value={query}
                onChange={setQuery}
                loading={loading}
                placeholder="搜索文章标题、内容..."
              />
            </div>

            {/* Results */}
            <div
              ref={resultsRef}
              className="max-h-[50vh] overflow-y-auto"
            >
              {!query && (
                <div className="p-8 text-center text-text-tertiary">
                  <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>输入关键词开始搜索</p>
                  <p className="text-sm mt-2">
                    支持搜索文章标题、摘要和正文
                  </p>
                </div>
              )}

              {query && !loading && results.length === 0 && !error && (
                <div className="p-8 text-center">
                  <p className="text-text-secondary mb-2">
                    没有找到与 "{query}" 相关的文章
                  </p>
                  <p className="text-sm text-text-tertiary">
                    尝试使用其他关键词或检查拼写
                  </p>
                </div>
              )}

              {error && (
                <div className="p-8 text-center text-red-400">
                  <p>{error}</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  {results.map((post, index) => (
                    <SearchResultItem
                      key={post.id}
                      post={post}
                      keyword={query}
                      selected={index === selectedIndex}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border-subtle px-4 py-3 flex items-center justify-between text-xs text-text-tertiary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  <kbd className="px-1.5 py-0.5 rounded bg-text-primary/10">↑↓</kbd>
                  <span>选择</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-text-primary/10">↵</kbd>
                  <span>打开</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-text-primary/10">esc</kbd>
                  <span>关闭</span>
                </span>
              </div>

              {total > results.length && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center gap-1 text-neon-cyan hover:underline"
                >
                  查看全部 {total} 条结果
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/search/SearchModal.tsx
git commit -m "feat(web): 添加搜索弹窗组件"
```

---

### Task 10: 集成搜索到导航栏

**Files:**
- Modify: `apps/web/src/components/Navbar.tsx`

- [ ] **Step 1: 导入和添加搜索按钮**

在 Navbar.tsx 顶部添加导入：
```tsx
import { SearchModal } from "./search/SearchModal";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { Search } from "lucide-react"; // 已导入，无需重复
```

在 Navbar 组件内部添加：
```tsx
export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // ... 其他状态

  // Cmd+K 快捷键
  useKeyboardShortcut({
    key: "k",
    meta: true,
    callback: () => setIsSearchOpen(true),
  });

  // ... 其他代码

  return (
    <>
      {/* ... 现有 header ... */}

      {/* Desktop Navigation 中添加搜索按钮 */}
      <nav className="hidden md:flex items-center gap-1">
        {/* ... 现有导航链接 ... */}

        {/* Search Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <Search className="w-4 h-4" />
          <span className="hidden lg:inline">搜索</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-text-primary/10 text-xs text-text-tertiary ml-1">
            ⌘K
          </kbd>
        </button>
      </nav>

      {/* Mobile Menu 中也添加搜索入口 */}
      {/* 在移动菜单的 nav 中添加 */}
      <motion.nav ...>
        <div className="glass rounded-2xl p-2 space-y-1">
          {/* ... 现有链接 ... */}

          {/* Mobile Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: mainNav.length * 0.05 }}
          >
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">搜索</span>
            </button>
          </motion.div>

          {/* ... 主题切换 ... */}
        </div>
      </motion.nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/Navbar.tsx
git commit -m "feat(web): 集成搜索弹窗到导航栏"
```

---

## Chunk 6: 前端页面 - 搜索结果页

### Task 11: 创建搜索结果页

**Files:**
- Create: `apps/web/src/pages/search.tsx`

- [ ] **Step 1: 实现搜索结果页**

```tsx
// apps/web/src/pages/search.tsx
import type { SearchPost } from "@blog/shared-types";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  RotateCcw,
  Search,
} from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SearchPageProps {
  initialResults: SearchPost[];
  initialTotal: number;
  initialQuery: string;
}

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async ({
  query,
  req,
}) => {
  const keyword = (query.q as string) || "";

  if (!keyword.trim()) {
    return {
      props: {
        initialResults: [],
        initialTotal: 0,
        initialQuery: "",
      },
    };
  }

  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: keyword, limit: 20 }),
    });

    const data = await response.json();

    return {
      props: {
        initialResults: data.success ? data.data : [],
        initialTotal: data.success ? data.meta.total : 0,
        initialQuery: keyword,
      },
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      props: {
        initialResults: [],
        initialTotal: 0,
        initialQuery: keyword,
      },
    };
  }
};

export default function SearchPage({
  initialResults,
  initialTotal,
  initialQuery,
}: SearchPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // 客户端搜索（用于刷新）
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await api.search.search({
        q: searchQuery,
        limit: 20,
      });

      if (response.success) {
        setResults(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // 更新 URL
    router.push(`/search?q=${encodeURIComponent(query)}`, undefined, {
      shallow: true,
    });

    performSearch(query);
  };

  // 高亮文本
  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;

    const escapeRegExp = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-neon-cyan/30 text-neon-cyan rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  return (
    <>
      <Head>
        <title>{query ? `${query} - 搜索结果` : "搜索"} | 博客</title>
        <meta
          name="description"
          content={query ? `"${query}" 的搜索结果` : "搜索博客文章"}
        />
      </Head>

      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-neon-cyan transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
              搜索文章
            </h1>

            <form onSubmit={handleSearch} className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入关键词搜索..."
                className="w-full pl-12 pr-24 py-4 rounded-xl glass border border-border-subtle text-text-primary placeholder:text-text-tertiary outline-none focus:border-neon-cyan/50 transition-colors"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      setTotal(0);
                    }}
                    className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  搜索
                </button>
              </div>
            </form>
          </motion.div>

          {/* Results Count */}
          {query && !loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-secondary mb-6"
            >
              找到 <span className="text-neon-cyan font-semibold">{total}</span>{" "}
              篇与 "<span class="font-medium">{query}</span>" 相关的文章
            </motion.p>
          )}

          {/* Results List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {results.length > 0 ? (
              results.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 rounded-xl glass border border-border-subtle hover:border-neon-cyan/30 transition-all"
                >
                  <Link href={`/posts/${post.slug}`}>
                    <h2 className="text-xl font-semibold text-text-primary mb-2 hover:text-neon-cyan transition-colors">
                      {highlightText(post.title, query)}
                    </h2>
                  </Link>

                  {post.summary && (
                    <p className="text-text-secondary mb-4 line-clamp-2">
                      {highlightText(post.summary, query)}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary">
                    {post.publishedAt && (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
                      </span>
                    )}
                    {post.category && (
                      <Link
                        href={`/categories/${post.category.slug}`}
                        className="text-neon-cyan hover:underline"
                      >
                        {post.category.name}
                      </Link>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className="px-2 py-1 rounded-full bg-text-primary/5 text-xs hover:bg-text-primary/10 transition-colors"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))
            ) : query && !loading ? (
              <div className="text-center py-20">
                <FileSearch className="w-16 h-16 mx-auto mb-6 text-text-tertiary" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  没有找到相关文章
                </h3>
                <p className="text-text-secondary mb-6">
                  尝试使用其他关键词或检查拼写
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/posts"
                    className="px-6 py-3 rounded-xl glass border border-border-subtle text-text-primary hover:border-neon-cyan/50 transition-all"
                  >
                    浏览全部文章
                  </Link>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/search.tsx
git commit -m "feat(web): 添加搜索结果页"
```

---

## Chunk 7: 样式和类型修复

### Task 12: 修复类型导出

**Files:**
- Modify: `packages/shared-types/src/index.ts`

- [ ] **Step 1: 确保类型正确导出**

```typescript
// packages/shared-types/src/index.ts
// ... 现有导出

// 添加搜索类型导出
export * from "./search";
```

- [ ] **Step 2: 重新生成类型**

Run:
```bash
cd /Users/jaluik/Github/mine/c-blog && pnpm install
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared-types/src/index.ts
git commit -m "fix(types): 修复搜索类型导出"
```

---

### Task 13: 代码检查和格式化

- [ ] **Step 1: 运行代码检查**

Run:
```bash
cd /Users/jaluik/Github/mine/c-blog && pnpm check
```
Expected: 无错误，或只有可自动修复的问题

- [ ] **Step 2: 修复任何问题**

如果有问题，运行：
```bash
cd /Users/jaluik/Github/mine/c-blog && pnpm format
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: 代码格式化和检查修复" || echo "No changes to commit"
```

---

## Chunk 8: 集成测试

### Task 14: 端到端测试

- [ ] **Step 1: 启动所有服务**

Run:
```bash
cd /Users/jaluik/Github/mine/c-blog && pnpm dev
```

- [ ] **Step 2: 测试 API**

In another terminal:
```bash
curl -X POST http://localhost:4000/api/search \
  -H "Content-Type: application/json" \
  -d '{"q": "技术", "limit": 5}'
```
Expected: 返回 JSON，success: true，包含文章数据

- [ ] **Step 3: 测试前端搜索弹窗**

1. 打开 http://localhost:3000
2. 按 Cmd+K，搜索弹窗应该出现
3. 输入关键词，应该显示搜索结果
4. 点击结果应该跳转到文章页

- [ ] **Step 4: 测试搜索结果页**

1. 在弹窗点击"查看全部结果"
2. 应该跳转到 /search?q=关键词
3. 页面应该显示完整搜索结果

- [ ] **Step 5: Commit 最终版本**

```bash
git add -A
git commit -m "feat(search): 实现完整的文章搜索功能

- 后端：添加 pg_trgm 索引和 /api/search 接口
- 前端：添加搜索弹窗（Cmd+K）和搜索结果页
- 支持中文模糊匹配和关键词高亮
- 按相似度和时间排序"
```

---

## 附录：开发命令速查

```bash
# 启动所有服务
pnpm dev

# 只启动 API
pnpm --filter @blog/api dev

# 只启动 Web
pnpm --filter @blog/web dev

# 数据库迁移
pnpm db:migrate

# 代码检查
pnpm check

# 格式化
pnpm format
```
