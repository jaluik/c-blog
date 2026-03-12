export type CommentStatus = "pending" | "approved" | "rejected";

export interface Comment {
  id: number;
  articleId: number;
  parentId?: number;
  githubUserId: string;
  githubUsername: string;
  githubAvatar?: string;
  content: string;
  status: CommentStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentInput {
  articleId: number;
  parentId?: number;
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface ModerateCommentInput {
  status: CommentStatus;
  rejectionReason?: string;
}
