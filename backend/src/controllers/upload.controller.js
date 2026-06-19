import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";

// Wraps Cloudinary's upload_stream in a Promise so we can use async/await
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "optimus-blog" }, // keeps uploads organized in their own Cloudinary folder
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// POST /api/uploads/image (protected)
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }

  const result = await streamUpload(req.file.buffer);

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});
