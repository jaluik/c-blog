import { FileText, FolderOpen, Home, type LucideIcon, Tag, User } from "lucide-react";
import { siteConfig } from "./site.config";

/**
 * 导航链接项
 */
export interface NavLink {
  /** 链接地址 */
  href: string;
  /** 显示标签 */
  label: string;
  /** Lucide 图标组件 */
  icon: LucideIcon;
}

/**
 * 页脚链接组
 */
export interface FooterLinkGroup {
  /** 分组标题 */
  title: string;
  /** 链接列表 */
  links: Array<{
    label: string;
    href: string;
  }>;
}

/**
 * 主导航配置
 */
export const mainNav: NavLink[] = [
  { href: "/", label: "首页", icon: Home },
  { href: "/posts", label: "文章", icon: FileText },
  { href: "/categories", label: "分类", icon: FolderOpen },
  { href: "/tags", label: "标签", icon: Tag },
  { href: "/about", label: "关于", icon: User },
];

/**
 * 页脚导航配置
 */
export const footerNav: FooterLinkGroup[] = [
  {
    title: "导航",
    links: [
      { label: "首页", href: "/" },
      { label: "分类", href: "/categories" },
      { label: "标签", href: "/tags" },
      { label: "关于", href: "/about" },
    ],
  },
  {
    title: "更多",
    links: [
      ...(siteConfig.rss.enabled ? [{ label: "RSS 订阅", href: siteConfig.rss.path }] : []),
      ...(siteConfig.sitemap.enabled ? [{ label: "站点地图", href: siteConfig.sitemap.path }] : []),
    ],
  },
];

/**
 * 社交媒体链接配置
 */
export const socialNav = [
  {
    label: "GitHub",
    href: siteConfig.social.github,
    icon: "Github" as const, // 使用字符串，组件中动态导入
  },
  {
    label: "Twitter",
    href: siteConfig.social.twitter,
    icon: "Twitter" as const,
  },
  {
    label: "Email",
    href: siteConfig.social.email,
    icon: "Mail" as const,
  },
];

/**
 * 移动端菜单配置
 */
export const mobileNav = {
  ...mainNav,
  themeToggleLabel: "主题",
};
