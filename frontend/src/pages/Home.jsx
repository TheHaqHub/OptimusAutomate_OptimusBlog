import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../api/post.api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    getPosts({ page })
      .then((res) => {
        if (!isMounted) return;
        setPosts(res.data.data.posts);
        setPagination(res.data.data.pagination);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Could not load posts. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-ink-muted text-sm">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Home Feed</h1>

      {posts.length === 0 ? (
        <div className="border border-hairline rounded-md p-8 text-center">
          <p className="text-ink-muted text-sm mb-4">No posts yet.</p>
          <Link to="/create" className="text-sm font-medium text-ink underline underline-offset-2">
            Write the first one
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post._id} className="flex gap-5 border-b border-hairline pb-8">
              {post.coverImageUrl && (
                <Link to={`/posts/${post.slug}`} className="flex-shrink-0 hidden sm:block">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-28 h-28 object-cover rounded-md"
                  />
                </Link>
              )}

              <div className="flex-1 min-w-0">
                <Link to={`/posts/${post.slug}`}>
                  <h2 className="highlight-on-hover inline font-display text-xl text-ink leading-snug">
                    {post.title}
                  </h2>
                </Link>

                <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-ink-muted">
                  {post.author?.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-hairline flex items-center justify-center text-[10px] font-medium text-ink">
                      {post.author?.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                  <span>{post.author?.name || "Unknown"}</span>
                  <span>·</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{post.likes?.length || 0} likes</span>
                  <span>·</span>
                  <span>{post.commentCount || 0} comments</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="text-sm font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
          >
            ← Previous
          </button>
          <span className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            className="text-sm font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}