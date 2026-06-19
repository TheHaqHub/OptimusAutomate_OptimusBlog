import express from "express";
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} from "../controllers/post.controller.js";
import { getComments, createComment } from "../controllers/comment.controller.js";
import { verifyJWT, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", optionalAuth, getPosts);
router.get("/:slug", optionalAuth, getPostBySlug);
router.post("/", verifyJWT, createPost);
router.put("/:id", verifyJWT, updatePost);
router.delete("/:id", verifyJWT, deletePost);
router.post("/:id/like", verifyJWT, toggleLike);

// Comments nested under posts, by post ID (not slug, to keep comment routes simple)
router.get("/:id/comments", getComments);
router.post("/:id/comments", verifyJWT, createComment);

export default router;
