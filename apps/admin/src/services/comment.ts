import type { Comment, PaginatedResponse, PaginationParams } from '@blog/shared-types';
import { request, requestPaginated } from './api';

interface CommentWithArticle extends Comment {
  article?: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface CommentListParams extends PaginationParams {
  articleId?: number;
  isApproved?: boolean;
}

export async function getComments(params: CommentListParams = {}): Promise<PaginatedResponse<CommentWithArticle>> {
  return requestPaginated<CommentWithArticle>({
    method: 'GET',
    url: '/admin/comments',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      articleId: params.articleId,
      isApproved: params.isApproved,
    },
  });
}

export async function approveComment(id: number, isApproved: boolean): Promise<Comment> {
  return request<Comment>({
    method: 'PATCH',
    url: `/admin/comments/${id}`,
    data: { isApproved },
  });
}

export async function deleteComment(id: number): Promise<void> {
  await request<void>({
    method: 'DELETE',
    url: `/admin/comments/${id}`,
  });
}
