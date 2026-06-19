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
        <span className="w-6 h-6 rounded-full bg-hairline flex items-center justify-center text-[11px] font-medium text-ink flex-shrink-0">
          {comment.author?.name?.[0]?.toUpperCase() || "?"}
        </span>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-ink">{comment.author?.name || "Unknown"}</span>
          <span className="text-ink-muted text-xs">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-ink mt-1">{comment.content}</p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          {onReply && (
            <button onClick={onReply} className="text-ink-muted hover:text-ink">
              Reply
            </button>
          )}
          {isOwnComment && (
            <button onClick={() => onDelete(comment._id)} className="text-red-600 hover:text-red-700">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}