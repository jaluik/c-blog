import type {
  Comment,
  CommentStatus,
  PaginatedResponse,
  PaginationParams,
} from "@blog/shared-types";
import { request, requestPaginated } from "./api";

interface CommentWithArticle extends Comment {
  article?: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface CommentListParams extends PaginationParams {
  articleId?: number;
  status?: CommentStatus;
}

export interface ModerateCommentData {
  status: CommentStatus;
  rejectionReason?: string;
}

export async function getComments(
  params: CommentListParams = {},
): Promise<PaginatedResponse<CommentWithArticle>> {
  return requestPaginated<CommentWithArticle>({
    method: "GET",
    url: "/admin/comments",
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      articleId: params.articleId,
      status: params.status,
    },
  });
}

export async function moderateComment(id: number, data: ModerateCommentData): Promise<Comment> {
  return request<Comment>({
    method: "PATCH",
    url: `/admin/comments/${id}`,
    data,
  });
}

export async function deleteComment(id: number): Promise<void> {
  await request<void>({
    method: "DELETE",
    url: `/admin/comments/${id}`,
  });
}
