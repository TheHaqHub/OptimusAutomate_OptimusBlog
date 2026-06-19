import apiClient from "./client.js";

export const getComments = (postId) => apiClient.get(`/posts/${postId}/comments`);
export const createComment = (postId, data) =>
  apiClient.post(`/posts/${postId}/comments`, data);
export const deleteComment = (commentId) => apiClient.delete(`/comments/${commentId}`);
