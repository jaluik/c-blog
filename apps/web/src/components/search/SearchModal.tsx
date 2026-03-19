"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileSearch, Keyboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SearchInput } from "./SearchInput";
import { SearchResultItem } from "./SearchResultItem";
import { useSearch } from "./useSearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { query, setQuery, results, loading, error, total } = useSearch({
    limit: 5,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="absolute inset-0 bg-bg-primary/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-2xl bg-bg-secondary/95 backdrop-blur-xl rounded-2xl border border-border-default shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-b border-border-subtle">
              <SearchInput
                ref={inputRef}
                value={query}
                onChange={setQuery}
                loading={loading}
                placeholder="搜索文章标题、内容..."
              />
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {!query && (
                <div className="p-8 text-center text-text-tertiary">
                  <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>输入关键词开始搜索</p>
                  <p className="text-sm mt-2">支持搜索文章标题、摘要和正文</p>
                </div>
              )}

              {query && !loading && results.length === 0 && !error && (
                <div className="p-8 text-center">
                  <p className="text-text-secondary mb-2">没有找到与 "{query}" 相关的文章</p>
                  <p className="text-sm text-text-tertiary">尝试使用其他关键词或检查拼写</p>
                </div>
              )}

              {error && (
                <div className="p-8 text-center text-red-400">
                  <p>{error}</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  {results.map((post, index) => (
                    <SearchResultItem
                      key={post.id}
                      post={post}
                      keyword={query}
                      selected={index === selectedIndex}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border-subtle px-4 py-3 flex items-center justify-between text-xs text-text-tertiary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  <kbd className="px-1.5 py-0.5 rounded bg-text-primary/10">↑↓</kbd>
                  <span>选择</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-text-primary/10">↵</kbd>
                  <span>打开</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-text-primary/10">esc</kbd>
                  <span>关闭</span>
                </span>
              </div>

              {total > results.length && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center gap-1 text-neon-cyan hover:underline"
                >
                  查看全部 {total} 条结果
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
