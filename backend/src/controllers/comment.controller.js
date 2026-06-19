import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// GET /api/posts/:id/comments
export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate("author", "name avatarUrl")
    .sort({ createdAt: 1 }); // oldest first, natural reading order

  res.status(200).json({
    success: true,
    message: "Comments fetched successfully",
    data: { comments },
  });
});

// POST /api/posts/:id/comments (protected)
export const createComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  const postId = req.params.id;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error("Comment content is required");
  }

  if (content.length > 1000) {
    res.status(400);
    throw new Error("Comment must be 1000 characters or fewer");
  }

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Enforce ONE-LEVEL nesting only: a reply cannot itself be replied to.
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) {
      res.status(404);
      throw new Error("Parent comment not found");
    }
    if (parent.parentComment) {
      res.status(400);
      throw new Error("Cannot reply to a reply - only one level of nesting is allowed");
    }
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content: content.trim(),
    parentComment: parentComment || null,
  });

  post.commentCount += 1;
  await post.save();

  const populatedComment = await comment.populate("author", "name avatarUrl");

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: { comment: populatedComment },
  });
});

// DELETE /api/comments/:id (protected, author only)
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (String(comment.author) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  // If this is a top-level comment, also delete its replies to avoid orphans
  const repliesCount = await Comment.countDocuments({ parentComment: comment._id });
  if (repliesCount > 0) {
    await Comment.deleteMany({ parentComment: comment._id });
  }

  await comment.deleteOne();

  // decrement the post's denormalized comment count by (1 + however many replies were removed)
  await Post.findByIdAndUpdate(comment.post, {
    $inc: { commentCount: -(1 + repliesCount) },
  });

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
    data: null,
  });
});
