import type { Category, PaginatedResponse, PostWithRelations, Tag } from "@blog/shared-types";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import { CategoryList } from "@/components/CategoryList";
import { Hero } from "@/components/Hero";
import { PostCard } from "@/components/PostCard";
import { TagCloud } from "@/components/TagCloud";
import { displayConfig } from "@/config";

interface HomeProps {
  posts: PostWithRelations[];
  featuredPosts: PostWithRelations[];
  categories: Category[];
  tags: Tag[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    const API_URL = process.env.API_URL || "http://localhost:4000";

    // Fetch posts, categories, and tags in parallel
    const [postsRes, categoriesRes, tagsRes] = await Promise.all([
      fetch(`${API_URL}/api/posts?page=1&pageSize=${displayConfig.home.latestPostsCount}`),
      fetch(`${API_URL}/api/categories`),
      fetch(`${API_URL}/api/tags`),
    ]);

    const postsData: PaginatedResponse<PostWithRelations> = await postsRes.json();
    const categoriesData = await categoriesRes.json();
    const tagsData = await tagsRes.json();

    // Get featured posts
    const featuredPosts = postsData.data.slice(0, displayConfig.home.featuredPostsCount);

    return {
      props: {
        posts: postsData.data,
        featuredPosts,
        categories: categoriesData.data || [],
        tags: tagsData.data || [],
        meta: postsData.meta,
      },
      revalidate: displayConfig.isr.homeRevalidate,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        posts: [],
        featuredPosts: [],
        categories: [],
        tags: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: displayConfig.pagination.defaultPageSize,
          totalPages: 0,
        },
      },
      revalidate: displayConfig.isr.homeRevalidate,
    };
  }
};

export default function HomePage({ posts, featuredPosts, categories, tags, meta }: HomeProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Content Section */}
      <div id="content" className="relative z-10">
        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-end justify-between mb-10"
              >
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-cyan mb-4">
                    精选文章
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">
                    推荐阅读
                  </h2>
                </div>
              </motion.div>

              {/* Featured Post Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Featured Post */}
                <div className="lg:col-span-1">
                  {featuredPosts[0] && <PostCard post={featuredPosts[0]} featured index={0} />}
                </div>

                {/* Secondary Featured Posts */}
                <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {featuredPosts
                    .slice(1, displayConfig.home.featuredPostsCount)
                    .map((post, index) => (
                      <PostCard key={post.id} post={post} index={index + 1} />
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && <CategoryList categories={categories} />}

        {/* Latest Posts Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-purple mb-4">
                  最新发布
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">
                  最新文章
                </h2>
              </div>

              <Link
                href="/posts"
                className="group flex items-center gap-2 text-text-secondary hover:text-neon-cyan transition-colors"
              >
                查看全部
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.slice(0, displayConfig.home.latestPostsCount).map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>

            {/* View All Button */}
            {meta.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass border border-border-subtle text-text-primary font-medium hover:border-neon-cyan/50 hover:bg-white/5 transition-all duration-200"
                >
                  浏览更多文章
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* Tags Section */}
        {displayConfig.home.showTags && tags.length > 0 && <TagCloud tags={tags} />}

        {/* Newsletter / CTA Section */}
        {displayConfig.home.showCtaSection && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl glass p-8 sm:p-12 lg:p-16 text-center"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-pink/10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                    准备好开始探索了吗？
                  </h2>
                  <p className="text-text-secondary max-w-2xl mx-auto mb-8">
                    浏览更多技术文章，或者了解更多关于这个博客的信息。
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/categories"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-void-primary font-semibold hover:opacity-90 transition-opacity"
                    >
                      浏览分类
                    </Link>
                    <Link
                      href="/about"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl glass border border-border-subtle text-text-primary font-medium hover:border-neon-cyan/50 transition-colors"
                    >
                      关于博客
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
