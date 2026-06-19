import apiClient from "./client.js";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiClient.post("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
