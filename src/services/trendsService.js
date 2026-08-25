import api from './api';

export const trendsService = {
  getTrends: async (platform) => {
    const response = await api.get(`/data/editorial-trends/${platform}`);
    return response.data;
  },
  updateTrends: async (platform, trendsData) => {
    const response = await api.put(`/data/editorial-trends/${platform}`, trendsData);
    return response.data;
  }
};
