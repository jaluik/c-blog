"use client";

import { motion } from "framer-motion";
import { ArrowDown, Code2, Cpu, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const typingTexts = [
  "探索代码的无限可能",
  "记录技术的点滴成长",
  "分享编程的乐趣",
  "在虚空中书写未来",
];

export function Hero() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = typingTexts[currentTextIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentFullText.length) {
            setDisplayText(currentFullText.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
          }
        }
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex]);

  const scrollToContent = () => {
    const contentSection = document.getElementById("content");
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Floating code symbols */}
        <motion.div
          className="absolute top-1/4 left-[10%] text-neon-cyan/20"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <Code2 className="w-16 h-16" />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-[15%] text-neon-purple/20"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <Terminal className="w-20 h-20" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 left-[20%] text-neon-pink/20"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <Cpu className="w-14 h-14" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-neon-cyan border border-neon-cyan/30">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            欢迎来到虚空代码
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-text-primary">虚空</span>
          <span className="text-gradient">代码</span>
        </motion.h1>

        {/* Typing Text */}
        <motion.div
          className="h-12 sm:h-16 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="font-mono text-xl sm:text-2xl md:text-3xl text-text-secondary">
            <span className="text-neon-cyan">$</span> {displayText}
            <span className="animate-pulse text-neon-cyan">|</span>
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          一个专注于技术分享的个人博客，涵盖前端开发、后端架构、
          人工智能等多个领域的学习心得与实践经验。
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="#content"
            onClick={(e) => {
              e.preventDefault();
              scrollToContent();
            }}
            className="group relative px-8 py-4 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            <span className="relative font-semibold text-void-primary flex items-center gap-2">
              开始探索
              <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/categories"
            className="px-8 py-4 rounded-xl border border-border-subtle text-text-primary font-medium hover:border-neon-cyan/50 hover:bg-white/5 transition-all duration-200"
          >
            浏览分类
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { label: "文章", value: "50+" },
            { label: "分类", value: "10+" },
            { label: "标签", value: "30+" },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-gradient mb-1">
                {stat.value}
              </div>
              <div className="text-text-tertiary text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.button
          onClick={scrollToContent}
          className="text-text-tertiary hover:text-neon-cyan transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ArrowDown className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </section>
  );
}
