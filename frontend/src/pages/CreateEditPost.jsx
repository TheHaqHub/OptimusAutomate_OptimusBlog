import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RichTextEditor from "../components/RichTextEditor";
import ImageDropzone from "../components/ImageDropzone";
import { createPost, updatePost, getPostBySlug } from "../api/post.api";

export default function CreateEditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = !!slug;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [postId, setPostId] = useState(null);

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    getPostBySlug(slug)
      .then((res) => {
        if (!isMounted) return;
        const post = res.data.data.post;

        if (post.author._id !== user?.id && post.author._id !== user?._id) {
          setError("You don't have permission to edit this post.");
          return;
        }

        setPostId(post._id);
        setTitle(post.title);
        setContent(post.content);
        setCoverImageUrl(post.coverImageUrl || "");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Could not load this post.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, isEditMode, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    setSubmitting(true);
    try {
      const postData = {
        title: title.trim(),
        content,
        coverImageUrl,
        status: "published",
      };

      let res;
      if (isEditMode) {
        res = await updatePost(postId, postData);
      } else {
        res = await createPost(postData);
      }

      const savedPost = res.data.data.post;
      navigate(`/posts/${savedPost.slug}`);
    } catch (err) {
      console.error("Post submission failed:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && isEditMode) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-muted hover:text-text transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-heading font-extrabold text-3xl text-text mb-1">
          {isEditMode ? "Edit Post" : "Create New Post"}
        </h1>
        <p className="text-sm text-muted mb-8">
          {isEditMode
            ? "Update your post and publish changes."
            : "Write something great. Share your thoughts with the world."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-sm2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Cover Image (optional)
            </label>
            <ImageDropzone value={coverImageUrl} onChange={setCoverImageUrl} />
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-text mb-2"
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full border border-border rounded-sm2 px-3 py-2 text-sm bg-card text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors"
            />
            <p className="text-xs text-muted mt-1">{title.length}/150</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Content *
            </label>
            <RichTextEditor content={content} onChange={setContent} />
            <p className="text-xs text-muted mt-2">
              Format your post with bold, italic, headings, lists, links, and
              images.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-text text-sm font-semibold rounded-sm2 px-6 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Publishing..."
                : isEditMode
                  ? "Update Post"
                  : "Publish Post"}
            </button>

            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/posts/${slug}` : "/")}
              className="text-sm font-medium text-muted hover:text-text transition-colors px-4 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}