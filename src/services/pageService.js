import api from './api';

export const pageService = {
  getAllPages: async () => {
    const response = await api.get('/pages/all');
    return response.data;
  },

  getPageById: async (pageId) => {
    const response = await api.get(`/pages/${pageId}`);
    return response.data;
  },

  deletePage: async (pageId) => {
    const response = await api.delete(`/pages/${pageId}`);
    return response.data;
  },

  getPageReviews: async (pageId) => {
    const response = await api.get(`/pages/${pageId}/reviews`);
    return response.data;
  },
};

