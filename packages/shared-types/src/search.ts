export interface SearchPost {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  publishedAt: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  similarity: number;
}

export interface SearchResponse {
  success: boolean;
  data: SearchPost[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SearchRequest {
  q: string;
  limit?: number;
  offset?: number;
}
