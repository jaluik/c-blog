import { motion } from "framer-motion";
import { Github, Heart, Mail, Sparkles, Twitter } from "lucide-react";
import Link from "next/link";

const footerLinks = [
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
      { label: "RSS 订阅", href: "/rss" },
      { label: "站点地图", href: "/sitemap.xml" },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border-subtle">
      {/* Gradient Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg opacity-80" />
                <Sparkles className="relative w-5 h-5 text-text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">VoidCode</span>
            </Link>
            <p className="text-text-secondary text-sm max-w-sm mb-6">
              在代码的虚空中探索技术的边界，记录学习的点滴，分享编程的乐趣。
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-cyan/50 transition-all duration-200"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-display font-semibold text-text-primary mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary hover:text-accent-cyan transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border-subtle">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text-tertiary text-sm">
              &copy; {new Date().getFullYear()} VoidCode. All rights reserved.
            </p>
            <p className="text-text-tertiary text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-accent-pink fill-accent-pink" /> and code
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
