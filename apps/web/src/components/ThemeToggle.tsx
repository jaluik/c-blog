"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
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

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const getIcon = () => {
    return isDark
      ? <Sun className="w-5 h-5 text-yellow-500" />
      : <Moon className="w-5 h-5 text-neon-cyan" />;
  };

  const getLabel = () => {
    return isDark ? "切换到亮色模式" : "切换到暗黑模式";
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
          key={resolvedTheme}
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
