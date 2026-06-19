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
        // Pull author display info from the first post, or fall back to currentUser if it's your own empty profile
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
      <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-500">
        <Link to="/login" className="underline">Log in</Link> to view your profile.
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        {authorInfo?.avatarUrl ? (
          <img
            src={authorInfo.avatarUrl}
            alt={authorInfo.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-medium text-gray-600">
            {authorInfo?.name?.[0]?.toUpperCase() || "?"}
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {authorInfo?.name || "Unknown User"}
          </h1>
          {isOwnProfile && (
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          )}
        </div>
      </div>

      <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
        {isOwnProfile ? "Your posts" : "Posts"}
      </h2>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {isOwnProfile ? "You haven't written anything yet." : "No posts yet."}
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post._id} className="border-b border-gray-200 pb-6">
              <Link to={`/posts/${post.slug}`} className="block group">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">
                  {post.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                {post.status === "draft" && (
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
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
  );
}