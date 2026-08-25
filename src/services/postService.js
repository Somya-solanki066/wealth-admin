import api from './api';

export const postService = {
  getFeed: async (page = 1, limit = 20) => {
    const response = await api.get('/posts/feed', {
      params: { page, limit }
    });
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  getUserPosts: async (userId) => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },

  getPagePosts: async (pageId) => {
    const response = await api.get(`/posts/page/${pageId}`);
    return response.data;
  },
};

