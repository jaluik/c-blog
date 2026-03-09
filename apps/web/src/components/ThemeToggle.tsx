"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg glass flex items-center justify-center">
        <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse" />
      </div>
    );
  }

  const currentTheme = theme || "system";

  const toggleTheme = () => {
    if (currentTheme === "dark") {
      setTheme("light");
    } else if (currentTheme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const getIcon = () => {
    switch (currentTheme) {
      case "light":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "dark":
        return <Moon className="w-5 h-5 text-neon-cyan" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLabel = () => {
    switch (currentTheme) {
      case "light":
        return "亮色模式";
      case "dark":
        return "暗黑模式";
      default:
        return "跟随系统";
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-cyan/50 transition-all duration-200 relative overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={getLabel()}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentTheme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
