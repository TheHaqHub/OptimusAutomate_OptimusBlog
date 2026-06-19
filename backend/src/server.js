import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]); // fixes SRV lookup failures on networks where Node's resolver can't reach default DNS

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

// --- Core middleware ---
app.use(express.json({ limit: "10mb" })); // parse JSON bodies; limit guards against oversized payloads
app.use(
  cors({
    origin: process.env.CLIENT_URL, // never "*" - explicit allowlist per security rules
    credentials: true,
  })
);

// --- Health check (useful for deployment platform checks) ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/uploads", uploadRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
};

startServer();
