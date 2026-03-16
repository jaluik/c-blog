import { siteConfig } from "./site.config";

/**
 * 技能项配置
 */
export interface SkillItem {
  /** 技能名称 */
  name: string;
  /** 熟练度 0-100 */
  level: number;
  /** Tailwind 渐变色类名 */
  color: string;
}

/**
 * 统计项配置
 */
export interface AboutStatItem {
  /** 显示标签 */
  label: string;
  /** 显示值 */
  value: string;
  /** Lucide 图标名称 */
  icon: string;
}

/**
 * 技术栈项配置
 */
export interface TechStackItem {
  /** 技术名称 */
  name: string;
  /** 技术描述 */
  description: string;
}

/**
 * 关于页面配置
 */
export const aboutConfig = {
  /** 页面标题 */
  pageTitle: `关于 ${siteConfig.name}`,

  /** 副标题 */
  subtitle: "一个专注于技术分享的个人博客，记录学习历程，分享编程心得",

  /** 页面标签 */
  badge: "关于博客",

  /** 博客理念/介绍段落 */
  philosophy: [
    `${siteConfig.nameZh}（虚空代码）诞生于对技术的热爱和对知识的渴望。`,
    `博客名称「虚空代码」寓意着在代码的虚空中探索无限可能。`,
    "这里涵盖前端开发、后端架构、人工智能、云原生等多个技术领域。",
  ],

  /** 技能列表 */
  skills: [
    { name: "React / Next.js", level: 95, color: "from-blue-500 to-cyan-500" },
    { name: "TypeScript", level: 90, color: "from-blue-600 to-blue-400" },
    { name: "Node.js", level: 85, color: "from-green-600 to-green-400" },
    { name: "Python", level: 75, color: "from-yellow-500 to-yellow-300" },
    { name: "Database", level: 80, color: "from-orange-500 to-red-500" },
    { name: "DevOps", level: 70, color: "from-purple-600 to-pink-500" },
  ] as SkillItem[],

  /** 统计数据 */
  stats: [
    { label: "文章", value: "50+", icon: "Globe" },
    { label: "项目", value: "20+", icon: "Terminal" },
    { label: "代码行", value: "100K+", icon: "Code2" },
    { label: "咖啡", value: "∞", icon: "Coffee" },
  ] as AboutStatItem[],

  /** 博客技术栈展示 */
  techStack: {
    title: "博客技术栈",
    items: [
      { name: "Next.js", description: "React Framework" },
      { name: "TypeScript", description: "Type Safety" },
      { name: "Tailwind", description: "Styling" },
      { name: "Fastify", description: "Backend API" },
      { name: "Prisma", description: "ORM" },
      { name: "PostgreSQL", description: "Database" },
      { name: "Vercel", description: "Deployment" },
      { name: "GitHub", description: "Version Control" },
    ] as TechStackItem[],
  },

  /** 技术栈部分标题 */
  skillsSectionTitle: "技术栈",

  /** CTA 区域配置 */
  cta: {
    title: "感谢你的访问",
    description: "如果你对我的文章感兴趣，欢迎订阅 RSS 或通过社交媒体关注我",
    primaryButton: {
      label: "浏览文章",
      href: "/",
    },
    secondaryButton: {
      label: "订阅 RSS",
      href: "/rss",
    },
  },

  /** 位置信息 */
  location: siteConfig.author.location,

  /** 动画配置 */
  animation: {
    /** 技能条动画延迟（秒） */
    skillBarDelay: 0.5,
    /** 技能条动画间隔（秒） */
    skillBarInterval: 0.1,
    /** 统计卡片动画延迟（秒） */
    statCardDelay: 0.2,
    /** 统计卡片动画间隔（秒） */
    statCardInterval: 0.1,
  },
} as const;

export type AboutConfig = typeof aboutConfig;
