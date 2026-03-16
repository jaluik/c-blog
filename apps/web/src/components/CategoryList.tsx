"use client";

import type { Category } from "@blog/shared-types";
import { motion } from "framer-motion";
import {
  Cloud,
  Code2,
  Cpu,
  Database,
  FolderOpen,
  Globe,
  Layers,
  Settings,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { displayConfig } from "@/config";

const iconMap: Record<string, React.ElementType> = {
  frontend: Code2,
  backend: Database,
  fullstack: Layers,
  mobile: Smartphone,
  cloud: Cloud,
  devops: Settings,
  ai: Cpu,
  web: Globe,
  default: FolderOpen,
};

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const getIcon = (slug: string) => {
    const key = Object.keys(iconMap).find((k) => slug.includes(k));
    return iconMap[key || "default"];
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-purple mb-4">
            <Sparkles className="w-4 h-4" />
            {displayConfig.categoryList.badgeText}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            {displayConfig.categoryList.title}
            <span className="text-gradient">{displayConfig.categoryList.titleHighlight}</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {displayConfig.categoryList.description}
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {categories.map((category) => {
            const Icon = getIcon(category.slug);
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link href={`/categories/${category.slug}`}>
                  <div className="group relative p-6 rounded-xl glass card-hover text-center">
                    {/* Icon */}
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center group-hover:from-neon-cyan/30 group-hover:to-neon-purple/30 transition-all">
                      <Icon className="w-6 h-6 text-neon-cyan" />
                    </div>

                    {/* Name */}
                    <h3 className="font-medium text-text-primary mb-1 group-hover:text-neon-cyan transition-colors">
                      {category.name}
                    </h3>

                    {/* Count */}
                    <p className="text-sm text-text-tertiary">
                      {category.articleCount || 0} {displayConfig.categoryList.articleCountSuffix}
                    </p>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
