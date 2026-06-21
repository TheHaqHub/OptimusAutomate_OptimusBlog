import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getPosts } from "../api/post.api";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { userId: paramUserId } = useParams(); // /profile/:userId for viewing others, undefined for your own

  // If no userId param, this is "my own profile" - use the logged-in user's id.
  const profileUserId = paramUserId || currentUser?.id || currentUser?._id;
  const isOwnProfile = profileUserId === (currentUser?.id || currentUser?._id);

  const [posts, setPosts] = useState([]);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileUserId) return;

    let isMounted = true;
    setLoading(true);
    setError("");

    getPosts({ author: profileUserId, limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        const fetchedPosts = res.data.data.posts;
        setPosts(fetchedPosts);
        if (fetchedPosts.length > 0) {
          setAuthorInfo(fetchedPosts[0].author);
        } else if (isOwnProfile) {
          setAuthorInfo(currentUser);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Could not load this profile.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profileUserId, isOwnProfile, currentUser]);

  if (!profileUserId) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-muted">
          <Link to="/login" className="underline text-secondary">Log in</Link> to view your profile.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-muted">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
          {authorInfo?.avatarUrl ? (
            <img
              src={authorInfo.avatarUrl}
              alt={authorInfo.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-xl font-semibold text-text">
              {authorInfo?.name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
          <div>
            <h1 className="font-heading font-bold text-xl text-text">
              {authorInfo?.name || "Unknown User"}
            </h1>
            {isOwnProfile && (
              <p className="text-sm text-muted">{currentUser?.email}</p>
            )}
          </div>
        </div>

        <h2 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wide">
          {isOwnProfile ? "Your posts" : "Posts"}
        </h2>

        {posts.length === 0 ? (
          <p className="text-muted text-sm">
            {isOwnProfile ? "You haven't written anything yet." : "No posts yet."}
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post._id} className="border-b border-border pb-6">
                <Link to={`/posts/${post.slug}`} className="block group">
                  <h3 className="font-heading font-semibold text-lg text-text group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                  {post.status === "draft" && (
                    <span className="px-1.5 py-0.5 bg-card border border-border text-muted rounded text-xs font-medium">
                      Draft
                    </span>
                  )}
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{post.likes?.length || 0} likes</span>
                  <span>·</span>
                  <span>{post.commentCount || 0} comments</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}