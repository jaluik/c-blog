import type { Category, PaginatedResponse, Post, Tag } from "@blog/shared-types";

const API_BASE = process.env.API_URL || "http://localhost:4000";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer ? `${API_BASE}/api` : "/api";
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  posts: {
    list: (params?: {
      page?: number;
      pageSize?: number;
      year?: number;
      month?: number;
      tag?: string;
    }) => {
      const { page = 1, pageSize = 10, year, month, tag } = params || {};
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (year) queryParams.append("year", String(year));
      if (month) queryParams.append("month", String(month));
      if (tag) queryParams.append("tag", tag);
      return fetchApi<PaginatedResponse<Post>>(`/posts?${queryParams.toString()}`);
    },
    get: (slug: string) => fetchApi<Post>(`/posts/${slug}`),
  },
  categories: {
    list: () => fetchApi<{ data: Category[] }>("/categories").then((r) => r.data),
  },
  tags: {
    list: () => fetchApi<{ data: Tag[] }>("/tags").then((r) => r.data),
  },
};
