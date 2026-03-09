'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post } from '@blog/shared-types';

interface PostNavigationProps {
  prevPost: Post | null;
  nextPost: Post | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
      {/* Previous Post */}
      <div>
        {prevPost ? (
          <Link href={`/posts/${prevPost.slug}`}>
            <motion.div
              className="group p-6 rounded-xl glass card-hover h-full"
              whileHover={{ x: -4 }}
            >
              <div className="flex items-center gap-2 text-sm text-neon-cyan mb-2">
                <ChevronLeft className="w-4 h-4" />
                <span>上一篇</span>
              </div>
              <h3 className="font-display font-semibold text-white group-hover:text-neon-cyan transition-colors line-clamp-2">
                {prevPost.title}
              </h3>
            </motion.div>
          </Link>
        ) : (
          <div className="p-6 rounded-xl glass opacity-50 h-full flex items-center">
            <span className="text-gray-500">没有更早的文章了</span>
          </div>
        )}
      </div>

      {/* Next Post */}
      <div className="md:text-right">
        {nextPost ? (
          <Link href={`/posts/${nextPost.slug}`}>
            <motion.div
              className="group p-6 rounded-xl glass card-hover h-full"
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center justify-end gap-2 text-sm text-neon-cyan mb-2">
                <span>下一篇</span>
                <ChevronRight className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-white group-hover:text-neon-cyan transition-colors line-clamp-2">
                {nextPost.title}
              </h3>
            </motion.div>
          </Link>
        ) : (
          <div className="p-6 rounded-xl glass opacity-50 h-full flex items-center justify-end">
            <span className="text-gray-500">没有更新的文章了</span>
          </div>
        )}
      </div>
    </nav>
  );
}
