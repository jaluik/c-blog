export interface SearchRequest {
  q: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  publishedAt: Date | null;
  createdAt: Date;
  categoryId: number | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  similarity: number;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
