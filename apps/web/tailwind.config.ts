import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          purple: "var(--accent-purple)",
          pink: "var(--accent-pink)",
          blue: "var(--accent-blue)",
          green: "var(--accent-green)",
        },
        border: {
          subtle: "var(--border-subtle)",
          default: "var(--border-default)",
          glow: "var(--border-glow)",
        },
        // Keep neon colors for compatibility
        neon: {
          cyan: "var(--accent-cyan)",
          purple: "var(--accent-purple)",
          pink: "var(--accent-pink)",
          blue: "var(--accent-blue)",
          green: "var(--accent-green)",
        },
        void: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero":
          "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple), var(--accent-pink))",
        "gradient-border": "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
        "gradient-glow": "radial-gradient(ellipse at center, var(--glow-cyan) 0%, transparent 70%)",
      },
      animation: {
        gradient: "gradient-shift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px var(--glow-cyan)" },
          "50%": { boxShadow: "0 0 40px var(--glow-cyan), 0 0 60px var(--glow-purple)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px var(--glow-cyan)",
        "neon-purple": "0 0 20px var(--glow-purple)",
        "neon-pink": "0 0 20px var(--glow-pink)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        card: "0 20px 40px rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [
    // Custom utilities
    ({ addUtilities }: { addUtilities: Function }) => {
      addUtilities({
        ".text-gradient": {
          background:
            "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple), var(--accent-pink))",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".border-gradient": {
          borderImage: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)) 1",
        },
        ".glass": {
          background: "var(--bg-glass)",
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid var(--border-subtle)",
        },
        ".glass-light": {
          background: "var(--bg-glass-light)",
          "backdrop-filter": "blur(8px)",
          "-webkit-backdrop-filter": "blur(8px)",
        },
        ".glow-text": {
          textShadow: "0 0 10px var(--glow-cyan), 0 0 20px var(--glow-cyan)",
        },
        ".grid-bg": {
          backgroundImage: `
            linear-gradient(var(--grid-line-color, rgba(0, 240, 255, 0.03)) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line-color, rgba(0, 240, 255, 0.03)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        },
      });
    },
  ],
};

export default config;
