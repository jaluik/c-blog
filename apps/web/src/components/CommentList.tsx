'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageSquare, ChevronDown, ChevronUp, User } from 'lucide-react';
import type { Comment } from '@blog/shared-types';

interface CommentListProps {
  comments: Comment[];
}

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-8 pl-4 border-l border-white/10' : ''}`}
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-white/10">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">
              {comment.githubUsername}
            </span>
            <span className="text-gray-500 text-sm">
              {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm', {
                locale: zhCN,
              })}
            </span>
          </div>

          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </div>

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
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">暂无评论，来发表第一条评论吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
