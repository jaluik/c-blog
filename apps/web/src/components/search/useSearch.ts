import type { SearchPost } from "@blog/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface UseSearchOptions {
  debounceMs?: number;
  limit?: number;
}

interface UseSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: SearchPost[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const { debounceMs = 200, limit = 10 } = options;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        setError(null);
        return;
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const response = await api.search.search({
          q: searchQuery.trim(),
          limit,
        });

        if (response.success) {
          setResults(response.data);
          setTotal(response.meta.total);
        } else {
          setError("搜索失败");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError("搜索服务暂时不可用");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs, performSearch]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    total,
    hasMore: results.length < total,
  };
}
