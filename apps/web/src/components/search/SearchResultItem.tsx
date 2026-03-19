"use client";

import type { SearchPost } from "@blog/shared-types";
import { Calendar, Folder } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface SearchResultItemProps {
  post: SearchPost;
  keyword: string;
  selected?: boolean;
  onClick?: () => void;
}

export function SearchResultItem({
  post,
  keyword,
  selected = false,
  onClick,
}: SearchResultItemProps) {
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;

    const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for text split results
          key={`highlight-${i}-${part}`}
          className="bg-neon-cyan/30 text-neon-cyan rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for text split results
        <span key={`text-${i}-${part}`}>{part}</span>
      ),
    );
  };

  const excerpt = useMemo(() => {
    const text = post.summary || "";
    if (!keyword.trim() || !text) return text;

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);

    if (index === -1) {
      return text.slice(0, 100) + (text.length > 100 ? "..." : "");
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < text.length ? "..." : "";

    return prefix + text.slice(start, end) + suffix;
  }, [post.summary, keyword]);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/posts/${post.slug}`}
      onClick={onClick}
      className={`block p-4 rounded-xl transition-all duration-200 ${
        selected
          ? "bg-neon-cyan/10 border border-neon-cyan/50"
          : "hover:bg-text-primary/5 border border-transparent"
      }`}
    >
      <h3 className="font-medium text-text-primary mb-2">{highlightText(post.title, keyword)}</h3>

      {excerpt && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {highlightText(excerpt, keyword)}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-text-tertiary">
        {formattedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        )}
        {post.category && (
          <span className="flex items-center gap-1">
            <Folder className="w-3 h-3" />
            {post.category.name}
          </span>
        )}
        {post.tags.length > 0 && (
          <span className="flex items-center gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag.id} className="px-1.5 py-0.5 rounded bg-text-primary/5">
                {tag.name}
              </span>
            ))}
            {post.tags.length > 2 && <span>+{post.tags.length - 2}</span>}
          </span>
        )}
      </div>
    </Link>
  );
}
