import type { Tag, CreateTagInput } from '@blog/shared-types';
import { request } from './api';

export interface TagWithCount extends Tag {
  articleCount?: number;
}

export async function getTags(): Promise<TagWithCount[]> {
  const response = await request<{ data: TagWithCount[] }>({
    method: 'GET',
    url: '/admin/tags',
  });
  return response.data;
}

export async function createTag(data: CreateTagInput): Promise<Tag> {
  const response = await request<{ data: Tag }>({
    method: 'POST',
    url: '/admin/tags',
    data,
  });
  return response.data;
}

export async function updateTag(id: number, data: Partial<CreateTagInput>): Promise<Tag> {
  const response = await request<{ data: Tag }>({
    method: 'PUT',
    url: `/admin/tags/${id}`,
    data,
  });
  return response.data;
}

export async function deleteTag(id: number): Promise<void> {
  await request<void>({
    method: 'DELETE',
    url: `/admin/tags/${id}`,
  });
}
