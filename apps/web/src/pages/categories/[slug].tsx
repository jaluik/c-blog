import type { Category, PaginatedResponse, PostWithRelations } from "@blog/shared-types";
import { motion } from "framer-motion";
import { ArrowLeft, FolderOpen } from "lucide-react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";

interface CategoryPageProps {
  category: Category | null;
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
    const res = await fetch(`${API_URL}/api/categories`);
    const data = await res.json();
    const categories: Category[] = data.data || [];

    const paths = categories.map((category) => ({
      params: { slug: category.slug },
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

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params }) => {
  try {
    const API_URL = process.env.API_URL || "http://localhost:4000";

    // Get all categories to find the current one
    const categoriesRes = await fetch(`${API_URL}/api/categories`);
    const categoriesData = await categoriesRes.json();
    const category = categoriesData.data?.find((c: Category) => c.slug === params?.slug);

    if (!category) {
      return { notFound: true };
    }

    // Get posts for this category
    const postsRes = await fetch(
      `${API_URL}/api/posts?page=1&pageSize=20&category=${params?.slug}`,
    );
    const postsData: PaginatedResponse<PostWithRelations> = await postsRes.json();

    return {
      props: {
        category,
        posts: postsData.data || [],
        meta: postsData.meta,
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        category: null,
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

export default function CategoryPage({ category, posts, meta }: CategoryPageProps) {
  if (!category) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl text-text-primary mb-4">分类不存在</h1>
          <Link href="/categories" className="text-neon-cyan hover:underline">
            返回分类列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm sm:text-base text-text-secondary hover:text-neon-cyan transition-colors mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回分类
          </Link>
        </motion.div>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-neon-cyan" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary">
                {category.name}
              </h1>
              <p className="text-text-secondary mt-1 text-sm sm:text-base">
                共 {meta.total} 篇文章
              </p>
            </div>
          </div>

          {category.description && (
            <p className="text-text-secondary max-w-2xl text-sm sm:text-base">
              {category.description}
            </p>
          )}
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
            <FolderOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">该分类下暂无文章</p>
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
