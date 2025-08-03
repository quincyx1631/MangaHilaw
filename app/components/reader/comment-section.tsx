"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageSquare, Reply, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";

function ReplyForm({
  commentId,
  user,
  cancelReply,
  submitReply,
  loading,
}: {
  commentId: string;
  user: any;
  cancelReply: () => void;
  submitReply: (content: string, parentId: string) => void;
  loading: boolean;
}) {
  const [content, setContent] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <Avatar className="w-6 h-6 mt-1">
        <AvatarImage src={user?.avatar_url} alt={user?.username} />
        <AvatarFallback>
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="Write a reply..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px] text-sm"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setContent("");
              cancelReply();
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              submitReply(content.trim(), commentId);
              setContent("");
            }}
            disabled={!content.trim() || loading}
          >
            <Send className="w-3 h-3 mr-1" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Comment {
  id: string;
  user_id: string;
  manga_id: string;
  chapter_hid: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  username: string;
  avatar_url?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  mangaId: string;
  chapterHid: string;
}

export default function CommentSection({
  mangaId,
  chapterHid,
}: CommentSectionProps) {
  const { isAuthenticated, token, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchComments();
  }, [mangaId, chapterHid]);

  const fetchComments = async () => {
    if (!mangaId || !chapterHid) {
      console.log("Missing mangaId or chapterHid, skipping fetch");
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${backendUrl}/api/comments/manga/${mangaId}/chapter/${chapterHid}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComments(data.data || []);
        } else {
          console.log("No comments found or error fetching comments");
          setComments([]);
        }
      } else {
        console.log("No comments found or error fetching comments");
        setComments([]);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (content: string, parentId?: string) => {
    if (!isAuthenticated || !token) {
      alert("Please log in to comment");
      return;
    }

    if (!content.trim() || !mangaId || !chapterHid) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          manga_id: mangaId,
          chapter_hid: chapterHid,
          content: content.trim(),
          parent_id: parentId,
        }),
      });

      const data = await response.json();

      if (data.success && data.comment) {
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), data.comment] }
                : c
            )
          );
          setReplyingTo(null);
        } else {
          setComments((prev) => [data.comment, ...prev]);
          setNewComment("");
        }
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!isAuthenticated || !token) return;

    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`${backendUrl}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setComments((prevComments) =>
          prevComments.filter((comment) => {
            if (comment.id === commentId) return false;
            comment.replies =
              comment.replies?.filter((reply) => reply.id !== commentId) || [];
            return true;
          })
        );
      } else {
        alert(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
    return `${Math.floor(seconds / 31536000)}y ago`;
  };
  const handleSetReplyingTo = useCallback((id: string) => {
    setReplyingTo((prev) => (prev === id ? null : id));
  }, []);

  const CommentCard = React.memo(function CommentCard({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) {
    return (
      <Card className={`${isReply ? "ml-8 mt-2" : ""}`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.avatar_url} alt={comment.username} />
              <AvatarFallback>
                {comment.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.username}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(comment.created_at)}
                </span>
              </div>

              <p className="text-sm mb-2">{comment.content}</p>

              <div className="flex items-center gap-2">
                {!isReply && isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetReplyingTo(comment.id)}
                    className="h-8 px-2 text-xs"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}

                {isAuthenticated && user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteComment(comment.id)}
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <ReplyForm
                  commentId={comment.id}
                  user={user}
                  cancelReply={() => setReplyingTo(null)}
                  submitReply={submitComment}
                  loading={submitting}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });

  const totalComments = comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  );
  if (!mangaId) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({totalComments})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </Button>
      </div>

      {showComments && (
        <>
          {/* Add comment form */}
          {isAuthenticated ? (
            <div className="mb-6">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={user?.avatar_url} alt={user?.username} />
                  <AvatarFallback>
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-2 min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => submitComment(newComment)}
                      disabled={!newComment.trim() || submitting}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 border rounded-lg text-center">
              <p className="text-muted-foreground">
                Please log in to leave a comment
              </p>
            </div>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <CommentCard comment={comment} />
                  {comment.replies?.map((reply) => (
                    <CommentCard key={reply.id} comment={reply} isReply />
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
