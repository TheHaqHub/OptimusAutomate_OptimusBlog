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
      <div className="min-h-screen bg-bg">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-muted text-sm">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="font-heading font-extrabold text-text text-3xl mb-8">
            No articles yet
          </h1>
          <div className="border border-border rounded-md2 p-8 text-center bg-card">
            <p className="text-muted text-sm mb-4">Nothing published yet.</p>
            <Link
              to="/create"
              className="text-sm font-semibold text-secondary underline underline-offset-2"
            >
              Write the first one
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Featured = the most recent post, but only on page 1 (it should mean
  // "the latest thing", not "whatever happens to load first on this page").
  const showFeatured = page === 1;
  const featured = showFeatured ? posts[0] : null;
  const rest = showFeatured ? posts.slice(1) : posts;

  const Eyebrow = ({ post, className = "" }) => (
    <p className={`text-xs font-semibold text-secondary uppercase tracking-wide mb-2 ${className}`}>
      {new Date(post.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}
    </p>
  );

  const Byline = ({ post }) => (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
      {post.author?.avatarUrl ? (
        <img
          src={post.author.avatarUrl}
          alt={post.author.name}
          className="w-5 h-5 rounded-full object-cover"
        />
      ) : (
        <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-semibold text-text">
          {post.author?.name?.[0]?.toUpperCase() || "?"}
        </span>
      )}
      <span>{post.author?.name || "Unknown"}</span>
      <span>·</span>
      <span>{post.likes?.length || 0} likes</span>
      <span>·</span>
      <span>{post.commentCount || 0} comments</span>
    </div>
  );

  const CardImage = ({ post, heightClass }) => {
    if (post.coverImageUrl) {
      return (
        <div className={`overflow-hidden rounded-sm2 mb-4 ${heightClass}`}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      );
    }
    // No fake illustration - a minimal bordered block, same height, so grid rows stay aligned.
    return (
      <div className={`rounded-sm2 mb-4 bg-surface2 border border-border ${heightClass}`} />
    );
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-heading font-extrabold text-text text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] mb-6">
            Thoughts on building,
            <br />
            writing, and sharing.
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-8 max-w-md">
            A space for real, unpolished writing — code, ideas, and the things
            worth working through out loud.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <a
              href="#latest"
              className="bg-primary text-text text-sm font-semibold rounded-sm2 px-6 py-3 hover:bg-primary/90 transition-colors"
            >
              Start Reading
            </a>
            <Link
              to={`/posts/${posts[0].slug}`}
              className="border border-border text-text text-sm font-semibold rounded-sm2 px-6 py-3 hover:bg-card transition-colors"
            >
              Read Latest Post
            </Link>
          </div>

          {pagination && (
            <div className="flex items-center gap-8 text-sm">
              <div>
                <span className="font-heading font-bold text-text text-xl">
                  {pagination.total}
                </span>
                <span className="text-muted ml-1.5">
                  {pagination.total === 1 ? "Article" : "Articles"}
                </span>
              </div>
            </div>
          )}
        </div>

        <Link
          to={`/posts/${posts[0].slug}`}
          className="group block bg-card border border-border rounded-md2 p-6 hover:border-primary/50 transition-colors"
        >
          <CardImage post={posts[0]} heightClass="h-48" />
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Latest
          </p>
          <h2 className="font-heading font-bold text-text text-xl leading-snug mb-2">
            {posts[0].title}
          </h2>
          <p className="text-muted text-sm">by {posts[0].author?.name || "Unknown"}</p>
        </Link>
      </section>

      {/* FEATURED POST - full width, the same "latest" post, but a different
          treatment: this is the one big asymmetric card the design called for */}
      {featured && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <Link
            to={`/posts/${featured.slug}`}
            className="group block bg-card border border-border rounded-md2 overflow-hidden hover:border-primary/50 transition-colors lg:grid lg:grid-cols-2"
          >
            {featured.coverImageUrl ? (
              <div className="h-64 lg:h-full overflow-hidden">
                <img
                  src={featured.coverImageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="h-64 lg:h-full bg-surface2 flex items-center justify-center">
                <span className="font-heading font-bold text-7xl text-border">
                  {featured.title?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="p-8 flex flex-col justify-center">
              <Eyebrow post={featured} />
              <h2 className="font-heading font-extrabold text-text text-3xl leading-tight mb-4 group-hover:text-secondary transition-colors">
                {featured.title}
              </h2>
              <Byline post={featured} />
            </div>
          </Link>
        </section>
      )}

      {/* ARTICLE CARDS */}
      {rest.length > 0 && (
        <section id="latest" className="max-w-6xl mx-auto px-4 pb-16">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-6">
            Latest Articles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post._id}
                to={`/posts/${post.slug}`}
                className="group block bg-card border border-border rounded-md2 p-5 hover:border-primary/50 hover:-translate-y-1 transition-all duration-200"
              >
                <CardImage post={post} heightClass="h-36" />
                <Eyebrow post={post} />
                <h2 className="font-heading font-bold text-text text-base leading-snug mb-3 group-hover:text-secondary transition-colors">
                  {post.title}
                </h2>
                <Byline post={post} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="text-sm font-semibold text-text disabled:opacity-30 disabled:cursor-not-allowed hover:text-secondary transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="text-sm font-semibold text-text disabled:opacity-30 disabled:cursor-not-allowed hover:text-secondary transition-colors"
            >
              Next →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}