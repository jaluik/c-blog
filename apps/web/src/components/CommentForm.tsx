"use client";

import type { Comment } from "@blog/shared-types";
import { motion } from "framer-motion";
import { CheckCircle, Edit3, Loader2, MessageSquare, Send, X, XCircle } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface CommentFormProps {
  articleId: number;
  editingComment?: Comment | null;
  onCancelEdit?: () => void;
  onSuccess?: () => void;
}

export function CommentForm({
  articleId,
  editingComment,
  onCancelEdit,
  onSuccess,
}: CommentFormProps) {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const isEditing = !!editingComment;

  // 当进入编辑模式时，填充评论内容
  useEffect(() => {
    if (editingComment) {
      setContent(editingComment.content);
    } else {
      setContent("");
    }
  }, [editingComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !session) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const url = isEditing ? `/api/comments/${editingComment.id}` : "/api/comments";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing ? {} : { articleId }),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "操作失败，请稍后重试");
      }

      const data = await res.json();
      setContent("");
      setSubmitStatus("success");

      if (isEditing) {
        setSubmitMessage(data.message || "评论修改成功");
        // 编辑成功后取消编辑模式
        if (onCancelEdit) {
          setTimeout(() => {
            onCancelEdit();
          }, 1500);
        }
      } else {
        setSubmitMessage("评论提交成功，等待审核后显示");
      }

      // 成功后刷新评论列表
      if (onSuccess) {
        onSuccess();
      }

      // 3秒后清除提示
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting comment:", error);
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "操作失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    setSubmitStatus(null);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  if (status === "loading") {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 text-center"
      >
        <MessageSquare className="w-10 h-10 text-neon-cyan mx-auto mb-4" />
        <h3 className="font-display font-semibold text-text-primary mb-2">登录后发表评论</h3>
        <p className="text-text-secondary mb-6">使用 GitHub 账号登录，即可参与讨论</p>
        <button
          type="button"
          onClick={() => signIn("github")}
          className="px-6 py-3 rounded-xl bg-white text-void-primary font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="GitHub logo">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          使用 GitHub 登录
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={`glass rounded-xl p-6 transition-all duration-300 ${
        focused ? "border-neon-cyan/30 shadow-neon-cyan" : ""
      } ${isEditing ? "border-neon-cyan/20 bg-neon-cyan/5" : ""}`}
    >
      {/* 编辑模式标题 */}
      {isEditing && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-neon-cyan" />
            <span className="text-text-primary font-medium">编辑评论</span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full border border-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
            <span className="text-sm font-medium text-text-primary">
              {session.user?.name?.[0] || "U"}
            </span>
          </div>
        )}
        <span className="text-text-primary font-medium">{session.user?.name}</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={isEditing ? "修改你的评论..." : "写下你的评论..."}
        rows={4}
        className="w-full bg-text-primary/5 border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-neon-cyan/50 resize-none transition-colors"
        disabled={isSubmitting}
      />

      {submitStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            submitStatus === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {submitStatus === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{submitMessage}</span>
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-text-tertiary">支持 Markdown 格式</p>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary transition-colors"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-void-primary font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? "保存中..." : "提交中..."}
              </>
            ) : (
              <>
                {isEditing ? <Edit3 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {isEditing ? "保存修改" : "发表评论"}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
