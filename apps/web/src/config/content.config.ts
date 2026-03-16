/**
 * 内容展示配置
 * 控制 Markdown 渲染、代码高亮等
 */

export const contentConfig = {
  /**
   * Markdown 渲染配置
   */
  markdown: {
    /** 代码高亮主题 CSS 文件路径 */
    highlightTheme: "highlight.js/styles/atom-one-dark.css",

    /** 代码高亮主题名称（备用） */
    highlightThemeName: "atom-one-dark",

    /** prose 样式类名 */
    proseClass: "prose prose-lg max-w-none prose-headings:font-display dark:prose-invert",

    /** 行内代码样式 */
    inlineCode: {
      className: "bg-text-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-neon-cyan",
    },

    /** 代码块样式 */
    codeBlock: {
      className:
        "bg-void-tertiary border border-border-subtle rounded-xl p-4 overflow-x-auto my-6 shadow-inner",
    },

    /** 标题样式 */
    headings: {
      h1: {
        className: "font-display text-4xl font-bold mt-12 mb-6 text-text-primary",
      },
      h2: {
        className:
          "font-display text-2xl font-bold mt-10 mb-4 text-text-primary border-b border-border-subtle pb-3 scroll-mt-24",
        /** 是否自动生成 id */
        autoId: true,
      },
      h3: {
        className: "font-display text-xl font-semibold mt-8 mb-3 text-text-primary scroll-mt-24",
        /** 是否自动生成 id */
        autoId: true,
      },
      h4: {
        className: "font-display text-lg font-semibold mt-6 mb-2 text-text-secondary",
      },
    },

    /** 段落样式 */
    paragraph: {
      className: "my-4 leading-relaxed text-text-secondary",
    },

    /** 列表样式 */
    lists: {
      unordered: {
        className: "list-disc pl-6 my-4 space-y-2 text-text-secondary",
      },
      ordered: {
        className: "list-decimal pl-6 my-4 space-y-2 text-text-secondary",
      },
      item: {
        className: "leading-relaxed",
      },
    },

    /** 链接样式 */
    link: {
      className:
        "text-neon-cyan hover:text-neon-purple transition-colors inline-flex items-center gap-1",
      /** 是否在新窗口打开 */
      openInNewTab: true,
    },

    /** 引用块样式 */
    blockquote: {
      className: "border-l-4 border-neon-cyan/50 bg-neon-cyan/5 pl-6 pr-4 py-4 my-6 rounded-r-xl",
      innerClassName: "text-text-secondary italic",
    },

    /** 分隔线样式 */
    hr: {
      className: "my-8 border-border-subtle",
    },

    /** 表格样式 */
    table: {
      wrapperClassName: "overflow-x-auto my-6",
      className: "w-full border-collapse",
      header: {
        className: "bg-text-primary/5",
      },
      cell: {
        className:
          "border border-border-subtle px-4 py-3 text-left font-semibold text-text-primary",
      },
      dataCell: {
        className: "border border-border-subtle px-4 py-3 text-text-secondary",
      },
    },

    /** 图片样式 */
    image: {
      className: "rounded-xl my-6 shadow-lg border border-border-subtle",
    },

    /** 粗体样式 */
    strong: {
      className: "text-text-primary font-semibold",
    },
  },

  /**
   * 代码块配置
   */
  codeBlock: {
    /** 是否显示复制按钮 */
    showCopyButton: true,
    /** 是否显示语言标签 */
    showLanguageLabel: true,
    /** 支持的语言列表 */
    supportedLanguages: [
      "typescript",
      "javascript",
      "tsx",
      "jsx",
      "json",
      "css",
      "scss",
      "html",
      "bash",
      "shell",
      "python",
      "go",
      "rust",
      "sql",
      "yaml",
      "markdown",
    ],
  },

  /**
   * 评论配置
   */
  comments: {
    /** 每页评论数 */
    pageSize: 10,
    /** 是否允许嵌套回复 */
    allowReplies: true,
    /** 最大嵌套层级 */
    maxNestingLevel: 3,
    /** 评论排序方式 */
    sortBy: "newest" as const, // 'newest' | 'oldest' | 'popular'

    /** 评论状态文本 */
    status: {
      pending: {
        label: "审核中",
        colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      },
      approved: {
        label: "已通过",
        colorClass: "bg-green-500/10 text-green-400 border-green-500/20",
      },
      rejected: {
        label: "未通过",
        colorClass: "bg-red-500/10 text-red-400 border-red-500/20",
      },
    },

    /** 空评论提示 */
    emptyMessage: "暂无评论，来发表第一条评论吧！",

    /** 操作按钮文本 */
    actions: {
      edit: "编辑",
      delete: "删除",
      confirm: "确认",
      cancel: "取消",
      deleteConfirm: "确认删除？",
    },

    /** 回复相关 */
    replies: {
      collapse: "收起回复",
      viewReplies: "查看 {count} 条回复",
    },

    /** 审核提示 */
    moderation: {
      edited: "(已编辑)",
      rejectedTitle: "审核未通过",
      rejectedMessage: "您可以修改评论后重新提交审核",
    },

    /** 日期格式 */
    dateFormat: "yyyy-MM-dd HH:mm",
  },

  /**
   * 文章元数据显示配置
   */
  postMeta: {
    /** 是否显示作者 */
    showAuthor: false,
    /** 是否显示阅读时间 */
    showReadingTime: true,
    /** 是否显示最后更新时间 */
    showLastModified: true,
    /** 阅读时间计算：每分钟字数 */
    wordsPerMinute: 300,
  },
} as const;

export type ContentConfig = typeof contentConfig;
