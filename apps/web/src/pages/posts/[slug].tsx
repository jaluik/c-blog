import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PostNavigation } from "@/components/PostNavigation";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedPosts } from "@/components/RelatedPosts";
import { TableOfContents } from "@/components/TableOfContents";
import { api } from "@/lib/api";
import type { Comment, PostWithRelations } from "@blog/shared-types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  FolderOpen,
  Link as LinkIcon,
  Linkedin,
  MessageSquare,
  RefreshCw,
  Share2,
  Twitter,
} from "lucide-react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PostPageProps {
  post: PostWithRelations;
  prevPost: PostWithRelations | null;
  nextPost: PostWithRelations | null;
  allPosts: PostWithRelations[];
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.posts.list(1, 100);
  const paths = data.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  try {
    const API_URL = process.env.API_URL || "http://localhost:4000";

    // Fetch current post and all posts in parallel
    const [postRes, allPostsRes] = await Promise.all([
      fetch(`${API_URL}/api/posts/${params?.slug}`),
      fetch(`${API_URL}/api/posts?page=1&pageSize=100`),
    ]);

    if (!postRes.ok) {
      return { notFound: true };
    }

    const postData = await postRes.json();
    const post = postData.data;
    const allPostsData = await allPostsRes.json();
    const allPosts = allPostsData.data || [];

    // Find prev and next posts
    const currentIndex = allPosts.findIndex((p: PostWithRelations) => p.id === post.id);
    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

    return {
      props: {
        post,
        prevPost,
        nextPost,
        allPosts,
      },
      revalidate: 60,
    };
  } catch {
    return {
      notFound: true,
    };
  }
};

// Calculate reading time
function getReadingTime(content: string | undefined): number {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default function PostPage({ post, prevPost, nextPost, allPosts }: PostPageProps) {
  const readingTime = getReadingTime(post.content);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // 客户端获取评论（支持当前用户查看自己的待审核评论）
  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/comments/list?articleSlug=${encodeURIComponent(post.slug)}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post.slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add toast notification here
  };

  return (
    <>
      {/* Reading Progress */}
      <ReadingProgress />

      {/* Table of Contents Sidebar */}
      <TableOfContents />

      <article className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-neon-cyan transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              返回首页
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            {/* Category */}
            {post.category && (
              <Link
                href={`/categories/${post.category.slug}`}
                className="inline-flex items-center gap-1 text-neon-cyan text-sm font-medium mb-4 hover:underline"
              >
                <FolderOpen className="w-4 h-4" />
                {post.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt || post.createdAt), "yyyy年MM月dd日", {
                  locale: zhCN,
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readingTime} 分钟阅读
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.viewCount} 阅读
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`} className="tag">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </motion.header>

          {/* Cover Image */}
          {post.coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-2xl"
            >
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-void-primary/50 to-transparent" />
            </motion.div>
          )}

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <MarkdownContent content={post.content} />
          </motion.div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <Share2 className="w-5 h-5 text-neon-cyan" />
                分享文章
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[#1DA1F2]/20 transition-all"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[#0A66C2]/20 transition-all"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <button
                  onClick={copyLink}
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-neon-cyan/20 transition-all"
                  aria-label="Copy link"
                >
                  <LinkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Post Navigation */}
          <PostNavigation prevPost={prevPost} nextPost={nextPost} />

          {/* Related Posts */}
          <RelatedPosts posts={allPosts} currentPostId={post.id} />

          {/* Comments Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-text-primary flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-neon-cyan" />
                评论
                {!isLoadingComments && comments.length > 0 && (
                  <span className="text-lg text-text-tertiary">({comments.length})</span>
                )}
              </h2>
              <button
                onClick={fetchComments}
                disabled={isLoadingComments}
                className="p-2 rounded-lg text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors disabled:opacity-50"
                title="刷新评论"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingComments ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Comment Form */}
            <div className="mb-10">
              <CommentForm articleId={post.id} onSuccess={fetchComments} />
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <CommentList comments={comments} />
            )}
          </motion.section>
        </div>
      </article>
    </>
  );
}
