import api from './api';

export const catalogService = {
  getAiConfig: async () => {
    const response = await api.get('/data/ai-config');
    return response.data;
  },

  saveAiConfig: async (payload) => {
    const response = await api.put('/data/ai-config', payload);
    return response.data;
  },

  getSmartEditPrompt: async () => {
    const response = await api.get('/data/smart-edit-prompt');
    return response.data;
  },

  saveSmartEditPrompt: async (prompt) => {
    const response = await api.put('/data/smart-edit-prompt', { prompt });
    return response.data;
  },

  getAnalyzerPrompt: async (platform) => {
    const response = await api.get(`/data/analyzer-prompts/${encodeURIComponent(platform)}`);
    return response.data;
  },

  saveAnalyzerPrompt: async (platform, prompt) => {
    const response = await api.put(`/data/analyzer-prompts/${encodeURIComponent(platform)}`, { prompt });
    return response.data;
  },
};
