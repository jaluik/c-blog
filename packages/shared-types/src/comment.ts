export interface Comment {
  id: number;
  articleId: number;
  parentId?: number;
  githubUserId: string;
  githubUsername: string;
  githubAvatar?: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface CreateCommentInput {
  articleId: number;
  parentId?: number;
  content: string;
}
