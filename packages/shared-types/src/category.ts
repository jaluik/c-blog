export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}
