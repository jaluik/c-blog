import type { Tag as TagType } from "@blog/shared-types";
import { motion } from "framer-motion";
import { Hash, Sparkles, Tag } from "lucide-react";
import type { GetStaticProps } from "next";
import Link from "next/link";

interface TagsPageProps {
  tags: TagType[];
}

export const getStaticProps: GetStaticProps<TagsPageProps> = async () => {
  try {
    const API_URL = process.env.API_URL || "http://localhost:4000";
    const res = await fetch(`${API_URL}/api/tags`);
    const data = await res.json();

    return {
      props: {
        tags: data.data || [],
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        tags: [],
      },
      revalidate: 60,
    };
  }
};

export default function TagsPage({ tags }: TagsPageProps) {
  // Sort tags by article count (descending)
  const sortedTags = [...tags].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));

  // Calculate font size based on article count
  const getTagSize = (count: number) => {
    if (sortedTags.length === 0) return "text-base";
    const maxCount = Math.max(...sortedTags.map((t) => t.articleCount || 0));
    const minCount = Math.min(...sortedTags.map((t) => t.articleCount || 0));
    const range = maxCount - minCount || 1;
    const normalized = (count - minCount) / range;

    if (normalized > 0.8) return "text-2xl px-6 py-3";
    if (normalized > 0.6) return "text-xl px-5 py-2.5";
    if (normalized > 0.4) return "text-lg px-4 py-2";
    if (normalized > 0.2) return "text-base px-4 py-2";
    return "text-sm px-3 py-1.5";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-pink mb-4">
            <Sparkles className="w-4 h-4" />
            标签云
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            文章标签
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            通过标签快速定位感兴趣的技术话题，探索更多相关内容
          </p>
        </motion.div>

        {/* Tags Cloud */}
        {sortedTags.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-3"
          >
            {sortedTags.map((tag) => (
              <motion.div key={tag.id} variants={itemVariants}>
                <Link href={`/tags/${tag.slug}`}>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full glass border border-border-subtle hover:border-neon-cyan/50 hover:text-neon-cyan hover:shadow-neon-cyan transition-all duration-200 text-text-primary ${getTagSize(
                      tag.articleCount || 0,
                    )}`}
                  >
                    <Hash className="w-4 h-4 opacity-50" />
                    {tag.name}
                    <span className="opacity-50 text-xs">({tag.articleCount || 0})</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Tag className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">暂无标签</p>
          </div>
        )}

        {/* Stats */}
        {sortedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-text-tertiary">共 {sortedTags.length} 个标签</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
