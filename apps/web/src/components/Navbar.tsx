"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { mainNav, siteConfig } from "@/config";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { SearchModal } from "./search/SearchModal";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  // Cmd+K shortcut
  useKeyboardShortcut({
    key: "k",
    meta: true,
    callback: () => setIsSearchOpen(true),
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return router.pathname === "/";
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "glass shadow-lg" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                className="relative w-8 h-8 flex items-center justify-center"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="relative w-5 h-5 text-white" />
              </motion.div>
              <span className="font-display font-bold text-xl text-gradient">
                {siteConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNav.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {active && (
                      <motion.div
                        className="absolute inset-0 bg-text-primary/10 rounded-lg"
                        layoutId="nav-active"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </span>
                    {active && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-cyan"
                        layoutId="nav-indicator"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 text-text-secondary hover:text-text-primary"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">搜索</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-text-primary/10 text-xs text-text-tertiary ml-1">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-text-primary/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.nav
              className="absolute top-16 left-0 right-0 p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="glass rounded-2xl p-2 space-y-1">
                {mainNav.map((link, index) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-text-primary/10 text-text-primary"
                            : "text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-accent-cyan" : ""}`} />
                        <span className="font-medium">{link.label}</span>
                        {active && (
                          <motion.div
                            className="ml-auto w-2 h-2 rounded-full bg-accent-cyan"
                            layoutId="mobile-nav-indicator"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                {/* Mobile Search Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: mainNav.length * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                  >
                    <Search className="w-5 h-5" />
                    <span className="font-medium">搜索</span>
                  </button>
                </motion.div>
                {/* Mobile Theme Toggle */}
                <div className="pt-2 mt-2 border-t border-border-subtle">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-text-secondary text-sm">主题</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
