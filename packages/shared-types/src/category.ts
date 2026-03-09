export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  articleCount?: number;
  _count?: {
    posts: number;
  };
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}
