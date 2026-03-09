export interface Tag {
  id: number;
  name: string;
  slug: string;
  articleCount?: number;
  _count?: {
    posts: number;
  };
}

export interface CreateTagInput {
  name: string;
  slug: string;
}
