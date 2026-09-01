import api from './api';

export const feedbackService = {
  getFeedback: async (tool) => {
    const params = tool ? { tool } : {};
    const response = await api.get('/data/feedback', { params });
    return response.data;
  },
};
