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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (error && isEditMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-gray-700 hover:underline"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-1">
        {isEditMode ? "Edit Post" : "Create New Post"}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        {isEditMode
          ? "Update your post and publish changes."
          : "Write something great. Share your thoughts with the world."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Cover Image (optional)
          </label>
          <ImageDropzone value={coverImageUrl} onChange={setCoverImageUrl} />
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-900 mb-2"
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
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/150</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Content *
          </label>
          <RichTextEditor content={content} onChange={setContent} />
          <p className="text-xs text-gray-500 mt-2">
            Format your post with bold, italic, headings, lists, links, and
            images.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gray-900 text-white text-sm font-medium rounded-md px-6 py-2.5 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-sm font-medium text-gray-700 hover:underline px-4 py-2.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
