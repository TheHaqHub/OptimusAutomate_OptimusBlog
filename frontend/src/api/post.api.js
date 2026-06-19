import apiClient from "./client.js";

export const getPosts = (params) => apiClient.get("/posts", { params });
export const getPostBySlug = (slug) => apiClient.get(`/posts/${slug}`);
export const createPost = (data) => apiClient.post("/posts", data);
export const updatePost = (id, data) => apiClient.put(`/posts/${id}`, data);
export const deletePost = (id) => apiClient.delete(`/posts/${id}`);
export const toggleLike = (id) => apiClient.post(`/posts/${id}/like`);
