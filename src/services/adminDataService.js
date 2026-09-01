import api from './api';

export const adminDataService = {
  getProjects: async () => {
    const response = await api.get('/data/projects');
    return response.data;
  },
  getProjectById: async (id) => {
    const response = await api.get(`/data/projects/${id}`);
    return response.data;
  },
  getActiveWriters: async () => {
    const response = await api.get('/data/active-writers');
    return response.data;
  },
  getAiUsage: async (tool) => {
    const params = tool ? { tool } : {};
    const response = await api.get('/data/ai-usage', { params });
    return response.data;
  },
};
