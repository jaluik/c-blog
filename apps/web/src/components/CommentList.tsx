"use client";

import type { Comment, CommentStatus } from "@blog/shared-types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  MessageSquare,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface CommentListProps {
  comments: Comment[];
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
}

function getStatusBadge(status: CommentStatus) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          审核中
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle className="w-3 h-3" />
          已通过
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="w-3 h-3" />
          未通过
        </span>
      );
  }
}

function CommentItem({
  comment,
  depth = 0,
  currentUserId,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  depth?: number;
  currentUserId?: string;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  // 判断是否是当前用户的评论
  const isOwnComment = currentUserId === comment.githubUserId;
  const isPending = comment.status === "pending";
  const isRejected = comment.status === "rejected";

  const handleDelete = () => {
    if (onDelete) {
      onDelete(comment.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? "ml-8 pl-4 border-l border-white/10" : ""}`}
    >
      <div className="flex gap-4 py-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.githubAvatar ? (
            <img
              src={comment.githubAvatar}
              alt={comment.githubUsername}
              className="w-10 h-10 rounded-full border border-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-border-subtle">
              <User className="w-5 h-5 text-text-secondary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-text-primary">{comment.githubUsername}</span>
            {isOwnComment && getStatusBadge(comment.status)}
            <span className="text-text-tertiary text-sm">
              {format(new Date(comment.createdAt), "yyyy-MM-dd HH:mm", {
                locale: zhCN,
              })}
              {comment.updatedAt !== comment.createdAt && <span className="ml-1">(已编辑)</span>}
            </span>
          </div>

          {/* 拒绝原因提示 */}
          {isOwnComment && isRejected && comment.rejectionReason && (
            <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-medium">审核未通过</p>
                  <p className="text-sm text-red-200/80 mt-1">{comment.rejectionReason}</p>
                  <p className="text-xs text-red-300/60 mt-2">您可以修改评论后重新提交审核</p>
                </div>
              </div>
            </div>
          )}

          <div
            className={`leading-relaxed whitespace-pre-wrap ${
              isOwnComment && (isPending || isRejected)
                ? "text-text-secondary/70 italic"
                : "text-text-secondary"
            }`}
          >
            {comment.content}
          </div>

          {/* 操作按钮（仅对自己的评论显示） */}
          {isOwnComment && (
            <div className="flex items-center gap-3 mt-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(comment)}
                  className="flex items-center gap-1 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑
                </button>
              )}
              {onDelete && (
                <>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">确认删除？</span>
                      <button
                        onClick={handleDelete}
                        className="text-sm text-red-400 hover:text-red-300 font-medium"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-sm text-text-tertiary hover:text-text-secondary"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Replies Toggle */}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mt-2 flex items-center gap-1 text-sm text-neon-cyan hover:underline"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  收起回复
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  查看 {comment.replies!.length} 条回复
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && showReplies && (
        <div className="space-y-2">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function CommentList({ comments, onEdit, onDelete }: CommentListProps) {
  const { data: session } = useSession();
  const currentUserId = (session as any)?.userId?.toString();

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary">暂无评论，来发表第一条评论吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
