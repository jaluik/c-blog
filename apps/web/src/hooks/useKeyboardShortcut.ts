import { useEffect } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(config: ShortcutConfig) {
  const { key, ctrl, meta, shift, alt, callback, preventDefault = true } = config;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrl === undefined || event.ctrlKey === ctrl;
      const metaMatch = meta === undefined || event.metaKey === meta;
      const shiftMatch = shift === undefined || event.shiftKey === shift;
      const altMatch = alt === undefined || event.altKey === alt;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, ctrl, meta, shift, alt, callback, preventDefault]);
}
