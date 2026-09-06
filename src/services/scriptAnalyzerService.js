import api from './api';

export const scriptAnalyzerService = {
  getPrompt: async (industry) => {
    const response = await api.get(`/data/script-analyzer-prompts/${encodeURIComponent(industry)}`);
    return response.data;
  },

  savePrompt: async (industry, prompt) => {
    const response = await api.put(`/data/script-analyzer-prompts/${encodeURIComponent(industry)}`, { prompt });
    return response.data;
  },

  analyze: async (payload) => {
    const response = await api.post('/data/script-analyze', payload);
    return response.data;
  },
};
