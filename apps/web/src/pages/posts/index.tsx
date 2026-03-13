"use client";

import type { PaginatedResponse, PostWithRelations, Tag } from "@blog/shared-types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Hash,
  Layers,
  RotateCcw,
  X,
} from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { api } from "@/lib/api";

interface PostsPageProps {
  initialPosts: PaginatedResponse<PostWithRelations>;
  initialTags: Tag[];
  availableYears: number[];
}

export const getServerSideProps: GetServerSideProps<PostsPageProps> = async ({ query, req }) => {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const page = Number(query.page) || 1;
  const year = query.year ? Number(query.year) : undefined;
  const month = query.month ? Number(query.month) : undefined;
  const tag = query.tag as string | undefined;

  try {
    // Fetch posts with filters
    const [postsRes, tagsRes] = await Promise.all([
      fetch(
        `${baseUrl}/api/posts?page=${page}&pageSize=12${year ? `&year=${year}` : ""}${month ? `&month=${month}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`,
      ),
      fetch(`${baseUrl}/api/tags`),
    ]);

    const postsData: PaginatedResponse<PostWithRelations> = await postsRes.json();
    const tagsData = await tagsRes.json();

    // Calculate available years from posts
    const yearsSet = new Set<number>();
    postsData.data.forEach((post) => {
      const date = new Date(post.publishedAt || post.createdAt);
      yearsSet.add(date.getFullYear());
    });
    // Also get all years from all posts
    const allPostsRes = await fetch(`${baseUrl}/api/posts?page=1&pageSize=1000`);
    const allPostsData = await allPostsRes.json();
    allPostsData.data.forEach((post: PostWithRelations) => {
      const date = new Date(post.publishedAt || post.createdAt);
      yearsSet.add(date.getFullYear());
    });

    return {
      props: {
        initialPosts: postsData,
        initialTags: tagsData.data || [],
        availableYears: Array.from(yearsSet).sort((a, b) => b - a),
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        initialPosts: {
          success: true,
          data: [],
          meta: { total: 0, page: 1, pageSize: 12, totalPages: 0 },
        },
        initialTags: [],
        availableYears: [],
      },
    };
  }
};

export default function PostsPage({ initialPosts, initialTags, availableYears }: PostsPageProps) {
  const router = useRouter();
  const { query } = router;

  // Parse URL query params
  const urlYear = query.year ? Number(query.year) : undefined;
  const urlMonth = query.month ? Number(query.month) : undefined;
  const urlTag = (query.tag as string) || undefined;
  const urlPage = query.page ? Number(query.page) : 1;

  // Local state
  const [posts, setPosts] = useState(initialPosts.data);
  const [meta, setMeta] = useState(initialPosts.meta);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(urlYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(urlMonth);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(urlTag);

  // Sync URL params with local state on initial load and back navigation
  useEffect(() => {
    setSelectedYear(urlYear);
    setSelectedMonth(urlMonth);
    setSelectedTag(urlTag);
  }, [urlYear, urlMonth, urlTag]);

  // Fetch posts when filters change
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.posts.list({
        page: urlPage,
        pageSize: 12,
        year: selectedYear,
        month: selectedMonth,
        tag: selectedTag,
      });
      if (response.success) {
        setPosts(response.data);
        setMeta(response.meta);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [urlPage, selectedYear, selectedMonth, selectedTag]);

  useEffect(() => {
    // Only fetch if URL params differ from initial props
    const filtersChanged =
      urlYear !== undefined || urlMonth !== undefined || urlTag !== undefined || urlPage !== 1;

    if (filtersChanged) {
      fetchPosts();
    }
  }, [urlYear, urlMonth, urlTag, urlPage, fetchPosts]);

  // Update URL when filters change
  const updateFilters = useCallback(
    (updates: {
      year?: number | null;
      month?: number | null;
      tag?: string | null;
      page?: number;
    }) => {
      const newQuery: Record<string, string | undefined> = {};

      if (updates.year !== undefined) {
        newQuery.year = updates.year ? String(updates.year) : undefined;
      } else if (selectedYear) {
        newQuery.year = String(selectedYear);
      }

      if (updates.month !== undefined) {
        newQuery.month = updates.month ? String(updates.month) : undefined;
      } else if (selectedMonth && !updates.year === undefined) {
        newQuery.month = String(selectedMonth);
      }

      if (updates.tag !== undefined) {
        newQuery.tag = updates.tag || undefined;
      } else if (selectedTag) {
        newQuery.tag = selectedTag;
      }

      if (updates.page !== undefined && updates.page > 1) {
        newQuery.page = String(updates.page);
      }

      // Remove undefined values
      Object.keys(newQuery).forEach((key) => {
        if (newQuery[key] === undefined) {
          delete newQuery[key];
        }
      });

      router.push(
        {
          pathname: "/posts",
          query: newQuery,
        },
        undefined,
        { shallow: true },
      );
    },
    [router, selectedYear, selectedMonth, selectedTag],
  );

  const handleYearChange = (year: number | undefined) => {
    setSelectedYear(year);
    setSelectedMonth(undefined); // Reset month when year changes
    updateFilters({ year: year || null, month: null, page: 1 });
  };

  const handleMonthChange = (month: number | undefined) => {
    setSelectedMonth(month);
    updateFilters({ month: month || null, page: 1 });
  };

  const handleTagChange = (tag: string | undefined) => {
    setSelectedTag(tag);
    updateFilters({ tag: tag || null, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const clearFilters = () => {
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
    setSelectedTag(undefined);
    router.push("/posts", undefined, { shallow: true });
  };

  const hasFilters = selectedYear || selectedMonth || selectedTag;

  // Generate month options (1-12)
  const months = useMemo(
    () => [
      { value: 1, label: "1月" },
      { value: 2, label: "2月" },
      { value: 3, label: "3月" },
      { value: 4, label: "4月" },
      { value: 5, label: "5月" },
      { value: 6, label: "6月" },
      { value: 7, label: "7月" },
      { value: 8, label: "8月" },
      { value: 9, label: "9月" },
      { value: 10, label: "10月" },
      { value: 11, label: "11月" },
      { value: 12, label: "12月" },
    ],
    [],
  );

  return (
    <>
      <Head>
        <title>全部文章 | 博客</title>
        <meta name="description" content="浏览所有技术文章，按时间和标签筛选" />
      </Head>

      <div className="min-h-screen">
        {/* Page Header */}
        <section className="pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-text-tertiary mb-6">
                <Link href="/" className="hover:text-neon-cyan transition-colors">
                  首页
                </Link>
                <span>/</span>
                <span className="text-text-primary">全部文章</span>
              </nav>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-cyan mb-4">
                    <Layers className="w-4 h-4" />
                    文章列表
                  </span>
                  <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary">
                    全部文章
                  </h1>
                  <p className="text-text-secondary mt-2">
                    共 <span className="text-neon-cyan font-semibold">{meta.total}</span> 篇文章
                    {hasFilters && " · 已应用筛选"}
                  </p>
                </div>

                {/* Clear Filters Button */}
                {hasFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border-subtle text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    清除筛选
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-border-subtle"
            >
              <div className="flex items-center gap-2 mb-4 text-text-primary">
                <Filter className="w-5 h-5 text-neon-cyan" />
                <span className="font-medium">筛选文章</span>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Time Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Year Select */}
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-text-tertiary flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      年份
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleYearChange(undefined)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          !selectedYear
                            ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50"
                            : "glass border border-border-subtle text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        全部
                      </button>
                      {availableYears.map((year) => (
                        <button
                          type="button"
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedYear === year
                              ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50"
                              : "glass border border-border-subtle text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Month Select - Only show when year is selected */}
                  {selectedYear && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-sm text-text-tertiary">月份</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleMonthChange(undefined)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            !selectedMonth
                              ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/50"
                              : "glass border border-border-subtle text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          全年
                        </button>
                        {months.map((month) => (
                          <button
                            type="button"
                            key={month.value}
                            onClick={() => handleMonthChange(month.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedMonth === month.value
                                ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/50"
                                : "glass border border-border-subtle text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {month.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Tag Filter */}
                <div className="flex-1">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-text-tertiary flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      标签
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => handleTagChange(undefined)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          !selectedTag
                            ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/50"
                            : "glass border border-border-subtle text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        全部标签
                      </button>
                      {initialTags.map((tag) => (
                        <button
                          type="button"
                          key={tag.id}
                          onClick={() => handleTagChange(tag.slug)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                            selectedTag === tag.slug
                              ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/50"
                              : "glass border border-border-subtle text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {tag.name}
                          <span className="text-xs opacity-60">({tag.articleCount || 0})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border-subtle"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-text-tertiary">当前筛选:</span>
                    {selectedYear && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan text-sm border border-neon-cyan/30">
                        {selectedYear}年
                        <button
                          type="button"
                          onClick={() => handleYearChange(undefined)}
                          className="hover:bg-neon-cyan/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedMonth && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-sm border border-neon-purple/30">
                        {selectedMonth}月
                        <button
                          type="button"
                          onClick={() => handleMonthChange(undefined)}
                          className="hover:bg-neon-purple/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedTag && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-pink/10 text-neon-pink text-sm border border-neon-pink/30">
                        #{initialTags.find((t) => t.slug === selectedTag)?.name || selectedTag}
                        <button
                          type="button"
                          onClick={() => handleTagChange(undefined)}
                          className="hover:bg-neon-pink/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={`skeleton-${i}`}
                      className="rounded-xl glass h-80 animate-pulse bg-white/5"
                    />
                  ))}
                </motion.div>
              ) : posts.length > 0 ? (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {posts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full glass flex items-center justify-center">
                    <Layers className="w-10 h-10 text-text-tertiary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">没有找到相关文章</h3>
                  <p className="text-text-secondary mb-6">
                    尝试调整筛选条件或清除筛选器查看更多文章
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    清除筛选
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <p className="text-sm text-text-tertiary">
                  显示第{" "}
                  <span className="text-text-primary">{(meta.page - 1) * meta.pageSize + 1}</span> -{" "}
                  <span className="text-text-primary">
                    {Math.min(meta.page * meta.pageSize, meta.total)}
                  </span>{" "}
                  条，共 <span className="text-text-primary">{meta.total}</span> 条
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page <= 1}
                    className="p-2 rounded-lg glass border border-border-subtle text-text-secondary hover:text-text-primary hover:border-neon-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(meta.totalPages)].map((_, i) => {
                      const page = i + 1;
                      const isActive = page === meta.page;

                      // Show first, last, current, and pages around current
                      const shouldShow =
                        page === 1 || page === meta.totalPages || Math.abs(page - meta.page) <= 1;

                      if (!shouldShow) {
                        // Show ellipsis
                        if (page === 2 || page === meta.totalPages - 1) {
                          return (
                            <span
                              key={page}
                              className="w-8 h-8 flex items-center justify-center text-text-tertiary"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          type="button"
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50"
                              : "glass border border-border-subtle text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page >= meta.totalPages}
                    className="p-2 rounded-lg glass border border-border-subtle text-text-secondary hover:text-text-primary hover:border-neon-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
