"use client";

import { ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { contentConfig } from "@/config";
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className={contentConfig.markdown.proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-8 sm:mt-12 mb-4 sm:mb-6 text-text-primary">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={String(children).toLowerCase().replace(/\s+/g, "-")}
              className="font-display text-xl sm:text-2xl font-bold mt-8 sm:mt-10 mb-3 sm:mb-4 text-text-primary border-b border-border-subtle pb-2 sm:pb-3 scroll-mt-24"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={String(children).toLowerCase().replace(/\s+/g, "-")}
              className="font-display text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-2 sm:mb-3 text-text-primary scroll-mt-24"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-display text-base sm:text-lg font-semibold mt-4 sm:mt-6 mb-2 text-text-secondary">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-3 sm:my-4 leading-relaxed text-text-secondary">{children}</p>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-text-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-neon-cyan">
                {children}
              </code>
            ) : (
              <pre className="bg-void-tertiary border border-border-subtle rounded-xl p-4 overflow-x-auto my-6 shadow-inner">
                <code className={`${className} font-mono text-sm`}>{children}</code>
              </pre>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-4 space-y-2 text-text-secondary">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2 text-text-secondary">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-neon-cyan hover:text-neon-purple transition-colors inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
              <ExternalLink className="w-3 h-3" />
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-neon-cyan/50 bg-neon-cyan/5 pl-4 sm:pl-6 pr-3 sm:pr-4 py-3 sm:py-4 my-4 sm:my-6 rounded-r-xl">
              <div className="text-text-secondary italic">{children}</div>
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-border-subtle" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-text-primary/5">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-border-subtle px-4 py-3 text-left font-semibold text-text-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border-subtle px-4 py-3 text-text-secondary">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg sm:rounded-xl my-4 sm:my-6 shadow-lg border border-border-subtle"
            />
          ),
          strong: ({ children }) => (
            <strong className="text-text-primary font-semibold">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
