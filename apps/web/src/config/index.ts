/**
 * 站点配置文件统一导出
 *
 * 使用方式:
 * ```ts
 * import { siteConfig, heroConfig, navigationConfig } from '@/config';
 * // 或者
 * import { siteConfig } from '@/config/site.config';
 * ```
 */

export {
  type AboutStatItem,
  aboutConfig,
  type SkillItem,
  type TechStackItem,
} from "./about.config";
export type { ContentConfig } from "./content.config";
export { contentConfig } from "./content.config";
export type { DisplayConfig } from "./display.config";
export { displayConfig } from "./display.config";
export type { HeroConfig, StatItem } from "./hero.config";
export { heroConfig } from "./hero.config";
export {
  type FooterLinkGroup,
  footerNav,
  mainNav,
  mobileNav,
  type NavLink,
  socialNav,
} from "./navigation.config";
export type { SiteConfig } from "./site.config";
export { siteConfig } from "./site.config";
