import type { ReactNode } from "react";
import { AnimatedBackground } from "./AnimatedBackground";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-bg-primary">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10">{children}</main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
