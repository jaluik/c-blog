"use client";

import { Search, X } from "lucide-react";
import { forwardRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  autoFocus?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = "搜索文章...", loading = false, autoFocus = true }, ref) => {
    return (
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
          {loading ? (
            <div className="w-5 h-5 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          // biome-ignore lint/a11y/noAutofocus: Search input needs autoFocus for modal UX
          autoFocus={autoFocus}
          className="w-full pl-12 pr-10 py-4 bg-transparent text-text-primary placeholder:text-text-tertiary text-lg outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-text-primary/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
