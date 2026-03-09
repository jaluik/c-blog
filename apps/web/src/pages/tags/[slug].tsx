import { PostCard } from "@/components/PostCard";
import type { PaginatedResponse, PostWithRelations, Tag } from "@blog/shared-types";
import { motion } from "framer-motion";
import { ArrowLeft, Hash, Tag as TagIcon } from "lucide-react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";

interface TagPageProps {
  tag: Tag | null;
  posts: PostWithRelations[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const API_URL = process.env.API_URL || "http://localhost:4000";
    const res = await fetch(`${API_URL}/api/tags`);
    const data = await res.json();
    const tags: Tag[] = data.data || [];

    const paths = tags.map((tag) => ({
      params: { slug: tag.slug },
    }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch {
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps: GetStaticProps<TagPageProps> = async ({ params }) => {
  try {
    const API_URL = process.env.API_URL || "http://localhost:4000";

    // Get all tags to find the current one
    const tagsRes = await fetch(`${API_URL}/api/tags`);
    const tagsData = await tagsRes.json();
    const tag = tagsData.data?.find((t: Tag) => t.slug === params?.slug);

    if (!tag) {
      return { notFound: true };
    }

    // Get posts for this tag
    const postsRes = await fetch(`${API_URL}/api/posts?page=1&pageSize=20&tag=${params?.slug}`);
    const postsData: PaginatedResponse<PostWithRelations> = await postsRes.json();

    return {
      props: {
        tag,
        posts: postsData.data || [],
        meta: postsData.meta,
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        tag: null,
        posts: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
      },
      revalidate: 60,
    };
  }
};

export default function TagPage({ tag, posts, meta }: TagPageProps) {
  if (!tag) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl text-text-primary mb-4">标签不存在</h1>
          <Link href="/tags" className="text-neon-cyan hover:underline">
            返回标签列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-neon-cyan transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回标签
          </Link>
        </motion.div>

        {/* Tag Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center">
              <Hash className="w-8 h-8 text-neon-pink" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">
                #{tag.name}
              </h1>
              <p className="text-text-secondary mt-1">共 {meta.total} 篇文章</p>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <TagIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">该标签下暂无文章</p>
          </motion.div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="mt-12 text-center">
            <p className="text-text-tertiary">
              第 {meta.page} 页，共 {meta.totalPages} 页
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
