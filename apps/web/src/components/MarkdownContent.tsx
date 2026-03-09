'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { ExternalLink } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-lg prose-invert max-w-none prose-headings:font-display">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-4xl font-bold mt-12 mb-6 text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={String(children).toLowerCase().replace(/\s+/g, '-')}
              className="font-display text-2xl font-bold mt-10 mb-4 text-white border-b border-white/10 pb-3 scroll-mt-24"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={String(children).toLowerCase().replace(/\s+/g, '-')}
              className="font-display text-xl font-semibold mt-8 mb-3 text-white scroll-mt-24"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-display text-lg font-semibold mt-6 mb-2 text-gray-200">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-relaxed text-gray-300">
              {children}
            </p>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-neon-cyan">
                {children}
              </code>
            ) : (
              <pre className="bg-void-tertiary border border-white/10 rounded-xl p-4 overflow-x-auto my-6 shadow-inner">
                <code className={`${className} font-mono text-sm`}>
                  {children}
                </code>
              </pre>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-4 space-y-2 text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
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
            <blockquote className="border-l-4 border-neon-cyan/50 bg-neon-cyan/5 pl-6 pr-4 py-4 my-6 rounded-r-xl">
              <div className="text-gray-300 italic">
                {children}
              </div>
            </blockquote>
          ),
          hr: () => (
            <hr className="my-8 border-white/10" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/5">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-white/10 px-4 py-3 text-gray-300">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-xl my-6 shadow-lg border border-white/10"
            />
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
