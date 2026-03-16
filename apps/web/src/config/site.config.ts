/**
 * 站点基本配置
 * 包含站点名称、Logo、描述、版权等信息
 */

export const siteConfig = {
  /** 站点名称 */
  name: "VoidCode",

  /** 站点中文名 */
  nameZh: "虚空代码",

  /** 站点短描述（用于导航栏） */
  shortDescription: "在代码的虚空中探索技术的边界，记录学习的点滴，分享编程的乐趣。",

  /** 站点描述（用于 SEO/元数据） */
  description:
    "一个专注于技术分享的个人博客，涵盖前端开发、后端架构、人工智能等多个领域的学习心得与实践经验。",

  /** 站点口号/标语 */
  tagline: "在代码的虚空中探索无限可能",

  /** 版权信息 */
  copyright: {
    startYear: 2024,
    holder: "VoidCode",
    suffix: "All rights reserved.",
  },

  /** 作者信息 */
  author: {
    name: "VoidCode",
    email: "hello@example.com",
    location: "Made with love on Earth",
  },

  /** 站点 Logo 配置 */
  logo: {
    icon: "Sparkles", // 使用 Lucide 图标名称
    gradient: {
      from: "neon-cyan",
      to: "neon-purple",
    },
  },

  /** 社交媒体链接（全局通用） */
  social: {
    github: "https://github.com",
    twitter: "https://twitter.com",
    email: "mailto:hello@example.com",
  },

  /** RSS 订阅 */
  rss: {
    enabled: true,
    path: "/rss",
  },

  /** 站点地图 */
  sitemap: {
    enabled: true,
    path: "/sitemap.xml",
  },
} as const;

export type SiteConfig = typeof siteConfig;
