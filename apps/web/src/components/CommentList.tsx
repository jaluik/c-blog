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
import { contentConfig } from "@/config";

interface CommentListProps {
  comments: Comment[];
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
}

function getStatusBadge(status: CommentStatus) {
  const config = contentConfig.comments.status;
  switch (status) {
    case "pending":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.pending.colorClass}`}
        >
          <Clock className="w-3 h-3" />
          {config.pending.label}
        </span>
      );
    case "approved":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.approved.colorClass}`}
        >
          <CheckCircle className="w-3 h-3" />
          {config.approved.label}
        </span>
      );
    case "rejected":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.rejected.colorClass}`}
        >
          <XCircle className="w-3 h-3" />
          {config.rejected.label}
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
      className={`${depth > 0 ? "ml-3 sm:ml-8 pl-3 sm:pl-4 border-l border-white/10" : ""}`}
    >
      <div className="flex gap-3 sm:gap-4 py-3 sm:py-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.githubAvatar ? (
            <img
              src={comment.githubAvatar}
              alt={comment.githubUsername}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-border-subtle">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-text-primary">{comment.githubUsername}</span>
            {isOwnComment && getStatusBadge(comment.status)}
            <span className="text-text-tertiary text-sm">
              {format(new Date(comment.createdAt), contentConfig.comments.dateFormat, {
                locale: zhCN,
              })}
              {comment.updatedAt !== comment.createdAt && (
                <span className="ml-1">{contentConfig.comments.moderation.edited}</span>
              )}
            </span>
          </div>

          {/* 拒绝原因提示 */}
          {isOwnComment && isRejected && comment.rejectionReason && (
            <div className="mb-3 p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-red-300 font-medium">
                    {contentConfig.comments.moderation.rejectedTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-red-200/80 mt-1">
                    {comment.rejectionReason}
                  </p>
                  <p className="text-xs text-red-300/60 mt-2">
                    {contentConfig.comments.moderation.rejectedMessage}
                  </p>
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
            <div className="flex items-center gap-2 sm:gap-3 mt-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(comment)}
                  className="flex items-center gap-1 text-xs sm:text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                >
                  <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {contentConfig.comments.actions.edit}
                </button>
              )}
              {onDelete &&
                (!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {contentConfig.comments.actions.delete}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm text-text-secondary">
                      {contentConfig.comments.actions.deleteConfirm}
                    </span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-medium"
                    >
                      {contentConfig.comments.actions.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs sm:text-sm text-text-tertiary hover:text-text-secondary"
                    >
                      {contentConfig.comments.actions.cancel}
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Replies Toggle */}
          {hasReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(!showReplies)}
              className="mt-2 flex items-center gap-1 text-sm text-neon-cyan hover:underline"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  {contentConfig.comments.replies.collapse}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {contentConfig.comments.replies.viewReplies.replace(
                    "{count}",
                    String(comment.replies?.length || 0),
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && showReplies && (
        <div className="space-y-2">
          {comment.replies?.map((reply) => (
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
  const currentUserId = session?.userId?.toString();

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary">{contentConfig.comments.emptyMessage}</p>
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
