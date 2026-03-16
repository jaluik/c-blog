import { siteConfig } from "./site.config";

/**
 * 统计数据项
 */
export interface StatItem {
  /** 显示标签 */
  label: string;
  /** 显示值 */
  value: string;
}

/**
 * Hero 区域配置
 */
export const heroConfig = {
  /** 欢迎标签文本 */
  welcomeBadge: `欢迎来到${siteConfig.nameZh}`,

  /** 主标题（可以包含 HTML 或特殊样式标记） */
  title: {
    prefix: "虚空",
    suffix: "代码",
  },

  /** 打字机效果的文案列表 */
  typingTexts: ["探索代码的无限可能", "记录技术的点滴成长", "分享编程的乐趣", "在虚空中书写未来"],

  /** 副标题/描述 */
  description:
    "一个专注于技术分享的个人博客，涵盖前端开发、后端架构、人工智能等多个领域的学习心得与实践经验。",

  /** 统计数据（首页 Hero 区域显示） */
  stats: [
    { label: "文章", value: "50+" },
    { label: "分类", value: "10+" },
    { label: "标签", value: "30+" },
  ] as StatItem[],

  /** CTA 按钮配置 */
  cta: {
    primary: {
      label: "开始探索",
      href: "#content",
      scrollToContent: true,
    },
    secondary: {
      label: "浏览分类",
      href: "/categories",
    },
  },

  /** 打字机动画配置 */
  animation: {
    /** 打字速度（毫秒） */
    typingSpeed: 100,
    /** 删除速度（毫秒） */
    deletingSpeed: 50,
    /** 文本完整显示后的暂停时间（毫秒） */
    pauseDuration: 2000,
  },

  /** 背景浮动图标配置 */
  floatingIcons: {
    enabled: true,
    icons: [
      {
        icon: "Code2",
        position: { top: "25%", left: "10%" },
        size: 64,
        opacity: 0.2,
        color: "neon-cyan",
      },
      {
        icon: "Terminal",
        position: { top: "33%", right: "15%" },
        size: 80,
        opacity: 0.2,
        color: "neon-purple",
      },
      {
        icon: "Cpu",
        position: { bottom: "25%", left: "20%" },
        size: 56,
        opacity: 0.2,
        color: "neon-pink",
      },
    ],
  },

  /** 滚动指示器 */
  scrollIndicator: {
    enabled: true,
    animation: {
      duration: 2,
      y: [0, 8, 0],
    },
  },
} as const;

export type HeroConfig = typeof heroConfig;
