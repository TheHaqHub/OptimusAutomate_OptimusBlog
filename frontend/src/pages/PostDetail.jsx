import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { getPostBySlug, toggleLike, deletePost } from "../api/post.api";
import { getComments, createComment, deleteComment } from "../api/comment.api";
import { useAuth } from "../context/AuthContext";
import CommentItem from "../components/CommentItem";

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    getPostBySlug(slug)
      .then((res) => {
        if (!isMounted) return;
        const fetchedPost = res.data.data.post;
        setPost(fetchedPost);
        return getComments(fetchedPost._id);
      })
      .then((res) => {
        if (!isMounted || !res) return;
        setComments(res.data.data.comments);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err.response?.status === 404
            ? "Post not found. It may have been deleted."
            : err.response?.data?.message || "Could not load this post."
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLiking(true);
    try {
      const res = await toggleLike(post._id);
      const { liked } = res.data.data;
      setPost((prev) => ({
        ...prev,
        likes: liked
          ? [...prev.likes, userId]
          : prev.likes.filter((id) => id !== userId),
      }));
    } catch {
      // non-critical action - failing to like shouldn't block the rest of the page
    } finally {
      setLiking(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(post._id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete post.");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await createComment(post._id, {
        content: commentText,
        parentComment: replyTo,
      });
      setComments((prev) => [...prev, res.data.data.comment]);
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      setCommentText("");
      setReplyTo(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev.filter((c) => c._id !== commentId && c.parentComment !== commentId)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete comment.");
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-ink-muted">Loading...</div>;
  }

  if (error && !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate("/")} className="text-sm text-ink-muted hover:text-ink">
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!post) return null;

  const isAuthor = userId && post.author?._id === userId;
  const userHasLiked = userId && post.likes?.includes(userId);
  const topLevelComments = comments.filter((c) => c && !c.parentComment);
const repliesFor = (commentId) =>
  comments.filter((c) => c && c.parentComment === commentId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full h-64 object-cover rounded-md mb-6"
        />
      )}

      <h1 className="font-display text-4xl text-ink leading-tight">{post.title}</h1>

      <div className="flex items-center justify-between mt-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          {post.author?.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-hairline flex items-center justify-center text-[11px] font-medium text-ink">
              {post.author?.name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
          <span>{post.author?.name || "Unknown"}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {isAuthor && (
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => navigate(`/posts/${post.slug}/edit`)}
              className="text-ink-muted hover:text-ink"
            >
              Edit
            </button>
            <button onClick={handleDeletePost} className="text-red-600 hover:text-red-700">
              Delete
            </button>
          </div>
        )}
      </div>

      <div
        className="prose prose-gray max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
      />

      <button
        onClick={handleLike}
        disabled={liking}
        className={`text-sm font-medium px-4 py-2 rounded-md border transition-colors ${
          userHasLiked
            ? "bg-highlighter text-ink border-highlighter"
            : "bg-paper text-ink-muted border-hairline hover:border-ink"
        } disabled:opacity-50`}
      >
        {userHasLiked ? "♥ Liked" : "♡ Like"} ({post.likes?.length || 0})
      </button>

      <hr className="my-10 border-hairline" />

      <h2 className="font-display text-2xl text-ink mb-5">
        Comments ({post.commentCount || 0})
      </h2>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          {replyTo && (
            <p className="text-sm text-ink-muted mb-2">
              Replying to a comment.{" "}
              <button type="button" onClick={() => setReplyTo(null)} className="text-ink underline">
                Cancel
              </button>
            </p>
          )}
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Add a comment..."
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-highlighter focus:border-highlighter"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="mt-2 bg-ink text-paper text-sm font-medium rounded-md px-4 py-2 hover:bg-ink/90 disabled:opacity-50"
          >
            {submittingComment ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink-muted mb-8">
          <Link to="/login" className="underline">Log in</Link> to leave a comment.
        </p>
      )}

      <div className="space-y-6">
        {topLevelComments.map((comment) => (
          <div key={comment._id}>
            <CommentItem
              comment={comment}
              currentUserId={userId}
              onDelete={handleDeleteComment}
              onReply={() => setReplyTo(comment._id)}
            />
            <div className="ml-8 mt-3 space-y-3">
              {repliesFor(comment._id).map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUserId={userId}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}