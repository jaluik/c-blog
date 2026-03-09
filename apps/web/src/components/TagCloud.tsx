'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Hash } from 'lucide-react';
import type { Tag } from '@blog/shared-types';

interface TagCloudProps {
  tags: Tag[];
}

export function TagCloud({ tags }: TagCloudProps) {
  // Calculate font size based on post count
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...tags.map((t) => t.articleCount || 0));
    const minCount = Math.min(...tags.map((t) => t.articleCount || 0));
    const range = maxCount - minCount || 1;
    const normalized = (count - minCount) / range;

    if (normalized > 0.8) return 'text-xl';
    if (normalized > 0.6) return 'text-lg';
    if (normalized > 0.4) return 'text-base';
    if (normalized > 0.2) return 'text-sm';
    return 'text-xs';
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-pink mb-4">
            <Hash className="w-4 h-4" />
            热门标签
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            通过标签发现<span className="text-gradient">更多内容</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            点击标签浏览相关文章，快速定位你感兴趣的技术话题
          </p>
        </motion.div>

        {/* Tag Cloud */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {tags.map((tag) => (
            <motion.div key={tag.id} variants={itemVariants}>
              <Link href={`/tags/${tag.slug}`}>
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass border border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-200 ${getTagSize(
                    tag.articleCount || 0
                  )}`}
                >
                  <Sparkles className="w-3 h-3 opacity-50" />
                  {tag.name}
                  <span className="text-xs opacity-50">
                    ({tag.articleCount || 0})
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
