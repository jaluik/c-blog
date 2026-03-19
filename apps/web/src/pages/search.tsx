import type { SearchPost } from "@blog/shared-types";
import { motion } from "framer-motion";
import { ArrowLeft, FileSearch, RotateCcw, Search } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { api } from "@/lib/api";

interface SearchPageProps {
  initialResults: SearchPost[];
  initialTotal: number;
  initialQuery: string;
}

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async ({ query, req }) => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}`, undefined, {
      shallow: true,
    });

    performSearch(query);
  };

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          // biome-ignore lint/suspicious/noArrayIndexKey: order is deterministic from text split
          key={`highlight-${part}-${index}`}
          className="bg-neon-cyan/30 text-neon-cyan rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        // biome-ignore lint/suspicious/noArrayIndexKey: order is deterministic from text split
        <span key={`text-${part}-${index}`}>{part}</span>
      ),
    );
  };

  return (
    <>
      <Head>
        <title>{query ? `${query} - 搜索结果` : "搜索"} | 博客</title>
        <meta name="description" content={query ? `"${query}" 的搜索结果` : "搜索博客文章"} />
      </Head>

      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">搜索文章</h1>

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

          {query && !loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-secondary mb-6"
            >
              找到 <span className="text-neon-cyan font-semibold">{total}</span> 篇与 "
              <span className="font-medium">{query}</span>" 相关的文章
            </motion.p>
          )}

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
                      <span>{new Date(post.publishedAt).toLocaleDateString("zh-CN")}</span>
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
                <h3 className="text-xl font-semibold text-text-primary mb-2">没有找到相关文章</h3>
                <p className="text-text-secondary mb-6">尝试使用其他关键词或检查拼写</p>
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
