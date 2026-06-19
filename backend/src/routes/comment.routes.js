import express from "express";
import { deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.delete("/:id", verifyJWT, deleteComment);

export default router;
