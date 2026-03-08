export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}
