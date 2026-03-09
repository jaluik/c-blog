import type {
  CreatePostInput,
  PaginatedResponse,
  PaginationParams,
  Post,
  PostWithRelations,
  UpdatePostInput,
} from "@blog/shared-types";
import { request, requestPaginated } from "./api";

export interface ArticleListParams extends PaginationParams {
  status?: "draft" | "published";
}

export async function getArticles(
  params: ArticleListParams = {},
): Promise<PaginatedResponse<PostWithRelations>> {
  return requestPaginated<PostWithRelations>({
    method: "GET",
    url: "/admin/posts",
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      status: params.status,
    },
  });
}

export async function getArticle(id: number): Promise<PostWithRelations> {
  return request<PostWithRelations>({
    method: "GET",
    url: `/admin/posts/${id}`,
  });
}

export async function createArticle(data: CreatePostInput): Promise<Post> {
  return request<Post>({
    method: "POST",
    url: "/admin/posts",
    data,
  });
}

export async function updateArticle(id: number, data: UpdatePostInput): Promise<Post> {
  return request<Post>({
    method: "PUT",
    url: `/admin/posts/${id}`,
    data,
  });
}

export async function deleteArticle(id: number): Promise<void> {
  await request<void>({
    method: "DELETE",
    url: `/admin/posts/${id}`,
  });
}
