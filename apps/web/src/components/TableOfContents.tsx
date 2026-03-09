"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Extract headings from the article content
    const article = document.querySelector("article");
    if (!article) return;

    const headingElements = article.querySelectorAll("h2, h3, h4");
    const items: TocItem[] = [];

    headingElements.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }

      items.push({
        id,
        text: heading.textContent || "",
        level: Number.parseInt(heading.tagName[1]),
      });
    });

    setHeadings(items);

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      },
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop TOC - Sidebar */}
      <aside className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-neon-cyan to-neon-purple rounded-full" />
            目录
          </h3>
          <nav className="space-y-1">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={`w-full text-left text-sm transition-all duration-200 rounded-lg px-3 py-2 ${
                  heading.level === 2 ? "pl-3" : heading.level === 3 ? "pl-6" : "pl-9"
                } ${
                  activeId === heading.id
                    ? "text-neon-cyan bg-neon-cyan/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                }`}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile TOC - Floating Button */}
      <div className="xl:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full glass border border-neon-cyan/30 flex items-center justify-center text-neon-cyan shadow-neon-cyan"
          aria-label="Toggle table of contents"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-4 left-4 z-50 glass rounded-xl p-4 max-h-[60vh] overflow-y-auto"
            >
              <h3 className="font-display font-semibold text-text-primary mb-4">目录</h3>
              <nav className="space-y-1">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={`w-full text-left text-sm transition-all duration-200 rounded-lg px-3 py-2 ${
                      heading.level === 2 ? "pl-3" : heading.level === 3 ? "pl-6" : "pl-9"
                    } ${
                      activeId === heading.id
                        ? "text-neon-cyan bg-neon-cyan/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                    }`}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
