import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { slugify } from "../utils/slugify.js";

// Generates a unique slug by appending a short suffix if the base slug already exists
const generateUniqueSlug = async (title) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (await Post.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// GET /api/posts?page=&limit=&search=
// GET /api/posts?page=&limit=&search=&author=
export const getPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const search = req.query.search?.trim();
  const authorId = req.query.author?.trim();

  const filter = {};

  if (authorId) {
    filter.author = authorId;
    const isOwnProfile = req.user && String(req.user._id) === authorId;
    filter.status = isOwnProfile ? { $in: ["draft", "published"] } : "published";
  } else {
    filter.status = "published";
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("author", "name avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-content"),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Posts fetched successfully",
    data: {
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
});
// GET /api/posts/:slug
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "author",
    "name avatarUrl"
  );

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // drafts only visible to their author
  if (post.status === "draft" && (!req.user || String(post.author._id) !== String(req.user._id))) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.status(200).json({
    success: true,
    message: "Post fetched successfully",
    data: { post },
  });
});

// POST /api/posts (protected)
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, coverImageUrl, status } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  if (title.length > 150) {
    res.status(400);
    throw new Error("Title must be 150 characters or fewer");
  }

  const slug = await generateUniqueSlug(title);

  const post = await Post.create({
    title,
    slug,
    content,
    coverImageUrl: coverImageUrl || "",
    author: req.user._id,
    status: status === "published" ? "published" : "draft",
  });

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: { post },
  });
});

// PUT /api/posts/:id (protected, author only)
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (String(post.author) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to edit this post");
  }

  const { title, content, coverImageUrl, status } = req.body;

  if (title && title !== post.title) {
    post.title = title;
    post.slug = await generateUniqueSlug(title);
  }
  if (content) post.content = content;
  if (coverImageUrl !== undefined) post.coverImageUrl = coverImageUrl;
  if (status && ["draft", "published"].includes(status)) post.status = status;

  await post.save();

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: { post },
  });
});

// DELETE /api/posts/:id (protected, author only)
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (String(post.author) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to delete this post");
  }

  // clean up associated comments so they don't orphan in the DB
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
    data: null,
  });
});

// POST /api/posts/:id/like (protected, toggle)
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userId = String(req.user._id);
  const alreadyLiked = post.likes.some((id) => String(id) === userId);

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => String(id) !== userId);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  res.status(200).json({
    success: true,
    message: alreadyLiked ? "Post unliked" : "Post liked",
    data: {
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    },
  });
});
