import express from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/image", verifyJWT, upload.single("image"), uploadImage);

export default router;
