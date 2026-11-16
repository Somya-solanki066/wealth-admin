import api from './api';

export const trendingScriptsService = {
  getScripts: async () => {
    const response = await api.get('/trending-scripts');
    return response.data;
  },

  getScript: async (id) => {
    const response = await api.get(`/trending-scripts/${id}`);
    return response.data;
  },

  createScript: async (data) => {
    const response = await api.post('/trending-scripts', data);
    return response.data;
  },

  updateScript: async (id, data) => {
    const response = await api.put(`/trending-scripts/${id}`, data);
    return response.data;
  },

  deleteScript: async (id) => {
    const response = await api.delete(`/trending-scripts/${id}`);
    return response.data;
  },

  addScene: async (scriptId, sceneData) => {
    const response = await api.post(`/trending-scripts/${scriptId}/scenes`, sceneData);
    return response.data;
  },

  updateScene: async (scriptId, sceneId, sceneData) => {
    const response = await api.put(
      `/trending-scripts/${scriptId}/scenes/${sceneId}`,
      sceneData
    );
    return response.data;
  },

  deleteScene: async (scriptId, sceneId) => {
    const response = await api.delete(
      `/trending-scripts/${scriptId}/scenes/${sceneId}`
    );
    return response.data;
  },

  seedScripts: async (force = true) => {
    const response = await api.post('/trending-scripts/admin/seed', { force });
    return response.data;
  },

  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await api.post('/trending-scripts/upload-cover-public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSubmissions: async () => {
    const response = await api.get('/trending-scripts/admin/submissions');
    return response.data;
  },

  actionSubmission: async (id, action, notes = '', rejectionReasons = [], editorNote = '') => {
    const response = await api.post(`/trending-scripts/admin/submissions/${id}/action`, {
      action,
      notes,
      rejectionReasons,
      editorNote,
    });
    return response.data;
  },
};

