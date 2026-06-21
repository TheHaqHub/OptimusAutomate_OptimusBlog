export default function CommentItem({ comment, currentUserId, onDelete, onReply }) {
  if (!comment) return null;

  const isOwnComment = currentUserId && comment.author?._id === currentUserId;

  return (
    <div className="flex gap-2">
      {comment.author?.avatarUrl ? (
        <img
          src={comment.author.avatarUrl}
          alt={comment.author.name}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <span className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-[11px] font-semibold text-text flex-shrink-0">
          {comment.author?.name?.[0]?.toUpperCase() || "?"}
        </span>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-text">{comment.author?.name || "Unknown"}</span>
          <span className="text-muted text-xs">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-text mt-1">{comment.content}</p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          {onReply && (
            <button onClick={onReply} className="text-muted hover:text-secondary transition-colors">
              Reply
            </button>
          )}
          {isOwnComment && (
            <button onClick={() => onDelete(comment._id)} className="text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}