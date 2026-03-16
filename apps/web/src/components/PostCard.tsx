"use client";

import type { PostWithRelations } from "@blog/shared-types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { displayConfig } from "@/config";

interface PostCardProps {
  post: PostWithRelations;
  featured?: boolean;
  index?: number;
}

export function PostCard({ post, featured = false, index = 0 }: PostCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: displayConfig.animation.duration,
        delay: index * displayConfig.animation.cardDelayInterval,
      },
    },
  };

  if (featured) {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="group relative"
      >
        <Link href={`/posts/${post.slug}`}>
          <div className="relative overflow-hidden rounded-2xl glass card-hover">
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-void-primary via-void-primary/50 to-transparent" />

              {/* Featured Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan text-sm font-medium border border-neon-cyan/30">
                  {displayConfig.featured.badgeText}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Category */}
              {post.category && (
                <span className="inline-block mb-3 text-neon-cyan text-sm font-medium">
                  {post.category.name}
                </span>
              )}

              {/* Title */}
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-3 group-hover:text-neon-cyan transition-colors line-clamp-2">
                {post.title}
              </h3>

              {/* Summary */}
              {post.summary && (
                <p className="text-text-secondary line-clamp-2 mb-4">{post.summary}</p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-text-tertiary">
                {displayConfig.postCard.showPublishDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(
                      new Date(post.publishedAt || post.createdAt),
                      displayConfig.postCard.dateFormat.full,
                      {
                        locale: zhCN,
                      },
                    )}
                  </span>
                )}
                {displayConfig.postCard.showViewCount && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.viewCount} 阅读
                  </span>
                )}
              </div>
            </div>

            {/* Hover Arrow */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-5 h-5 text-text-primary" />
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="group"
    >
      <Link href={`/posts/${post.slug}`}>
        <div className="relative overflow-hidden rounded-xl glass card-hover h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-void-secondary to-transparent opacity-60" />
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col">
            {/* Category & Tags */}
            <div className="flex items-center gap-2 mb-3">
              {post.category && (
                <span className="text-xs text-neon-cyan font-medium">{post.category.name}</span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-display text-lg font-bold text-text-primary mb-2 group-hover:text-neon-cyan transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Summary */}
            {post.summary && (
              <p className="text-text-secondary text-sm line-clamp-2 mb-4 flex-1">{post.summary}</p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-text-tertiary mt-auto">
              {displayConfig.postCard.showPublishDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(
                    new Date(post.publishedAt || post.createdAt),
                    displayConfig.postCard.dateFormat.short,
                    {
                      locale: zhCN,
                    },
                  )}
                </span>
              )}
              {displayConfig.postCard.showViewCount && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.viewCount}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {post.tags.slice(0, displayConfig.postCard.maxTagsDisplay).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-1 rounded-full bg-white/5 text-text-secondary border border-white/10"
                >
                  {tag.name}
                </span>
              ))}
              {post.tags.length > displayConfig.postCard.maxTagsDisplay && (
                <span className="text-xs px-2 py-1 text-text-tertiary">
                  +{post.tags.length - displayConfig.postCard.maxTagsDisplay}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
