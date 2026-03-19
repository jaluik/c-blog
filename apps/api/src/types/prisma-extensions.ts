export interface SearchResultWithJoins {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  publishedAt: Date | null;
  createdAt: Date;
  categoryId: number | null;
  "category.id"?: number;
  "category.name"?: string;
  "category.slug"?: string;
  similarity: number;
}
