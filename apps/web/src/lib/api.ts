import type { Post, Category, Tag, PaginatedResponse } from '@blog/shared-types';

const API_BASE = '/api';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
    list: (page = 1, pageSize = 10) =>
      fetchApi<PaginatedResponse<Post>>(`/posts?page=${page}&pageSize=${pageSize}`),
    get: (slug: string) => fetchApi<{ data: Post }>(`/posts/${slug}`).then(r => r.data),
  },
  categories: {
    list: () => fetchApi<{ data: Category[] }>('/categories').then(r => r.data),
  },
  tags: {
    list: () => fetchApi<{ data: Tag[] }>('/tags').then(r => r.data),
  },
};
