import type { Category } from './category';
import type { Tag } from './tag';

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: 'draft' | 'published';
  categoryId?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PostWithRelations extends Post {
  category?: Category | null;
  tags?: Tag[];
  commentCount?: number;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: 'draft' | 'published';
  categoryId?: number;
  tagIds?: number[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {}
