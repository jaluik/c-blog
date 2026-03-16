"use client";

import type { PostWithRelations } from "@blog/shared-types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { displayConfig } from "@/config";

interface RelatedPostsProps {
  posts: PostWithRelations[];
  currentPostId: number;
}

export function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  // Filter out current post and limit
  const relatedPosts = posts
    .filter((post) => post.id !== currentPostId)
    .slice(0, displayConfig.relatedPosts.maxCount);

  if (relatedPosts.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display text-2xl font-bold text-text-primary">相关文章</h3>
        <Link
          href="/"
          className="group flex items-center gap-1 text-sm text-neon-cyan hover:underline"
        >
          查看全部
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {relatedPosts.map((post) => (
          <motion.div key={post.id} variants={itemVariants}>
            <Link href={`/posts/${post.slug}`}>
              <div className="group p-5 rounded-xl glass card-hover h-full">
                {/* Category */}
                {post.category && (
                  <span className="text-xs text-neon-cyan font-medium">{post.category.name}</span>
                )}

                {/* Title */}
                <h4 className="font-display font-semibold text-text-primary mt-2 mb-3 group-hover:text-neon-cyan transition-colors line-clamp-2">
                  {post.title}
                </h4>

                {/* Summary */}
                {post.summary && (
                  <p className="text-text-secondary text-sm line-clamp-2 mb-4">{post.summary}</p>
                )}

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(post.publishedAt || post.createdAt), "yyyy-MM-dd", {
                    locale: zhCN,
                  })}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
