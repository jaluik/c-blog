import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Code2,
  Database,
  Globe,
  Smartphone,
  Cloud,
  Cpu,
  Layers,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { Category } from '@blog/shared-types';

interface CategoriesPageProps {
  categories: Category[];
}

const iconMap: Record<string, React.ElementType> = {
  'frontend': Code2,
  'backend': Database,
  'fullstack': Layers,
  'mobile': Smartphone,
  'cloud': Cloud,
  'devops': Settings,
  'ai': Cpu,
  'web': Globe,
  'default': FolderOpen,
};

export const getStaticProps: GetStaticProps<CategoriesPageProps> = async () => {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/api/categories`);
    const data = await res.json();

    return {
      props: {
        categories: data.data || [],
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        categories: [],
      },
      revalidate: 60,
    };
  }
};

export default function CategoriesPage({ categories }: CategoriesPageProps) {
  const getIcon = (slug: string) => {
    const key = Object.keys(iconMap).find((k) => slug.includes(k));
    return iconMap[key || 'default'];
  };

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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-purple mb-4">
            <Sparkles className="w-4 h-4" />
            内容分类
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            文章分类
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            浏览不同分类的文章，找到你感兴趣的技术话题
          </p>
        </motion.div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => {
              const Icon = getIcon(category.slug);
              return (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link href={`/categories/${category.slug}`}>
                    <div className="group p-6 rounded-2xl glass card-hover h-full">
                      <div className="flex items-start justify-between mb-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center group-hover:from-neon-cyan/30 group-hover:to-neon-purple/30 transition-all">
                          <Icon className="w-7 h-7 text-neon-cyan" />
                        </div>

                        {/* Article Count */}
                        <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-sm">
                          {category.articleCount || 0} 篇
                        </span>
                      </div>

                      {/* Name */}
                      <h2 className="font-display text-xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                        {category.name}
                      </h2>

                      {/* Description */}
                      {category.description ? (
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {category.description}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          浏览 {category.name} 相关的文章
                        </p>
                      )}

                      {/* Link */}
                      <div className="mt-4 flex items-center gap-1 text-sm text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        查看文章
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">暂无分类</p>
          </div>
        )}
      </div>
    </div>
  );
}
