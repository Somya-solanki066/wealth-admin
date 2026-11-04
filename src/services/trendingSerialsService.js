import api from './api';

export const trendingSerialsService = {
  getSerials: async () => {
    const response = await api.get('/trending-serials');
    return response.data;
  },

  getSerial: async (id) => {
    const response = await api.get(`/trending-serials/${id}`);
    return response.data;
  },

  createSerial: async (data) => {
    const response = await api.post('/trending-serials', data);
    return response.data;
  },

  updateSerial: async (id, data) => {
    const response = await api.put(`/trending-serials/${id}`, data);
    return response.data;
  },

  deleteSerial: async (id) => {
    const response = await api.delete(`/trending-serials/${id}`);
    return response.data;
  },

  addChapter: async (serialId, chapterData) => {
    const response = await api.post(`/trending-serials/${serialId}/chapters`, chapterData);
    return response.data;
  },

  updateChapter: async (serialId, chapterId, chapterData) => {
    const response = await api.put(
      `/trending-serials/${serialId}/chapters/${chapterId}`,
      chapterData
    );
    return response.data;
  },

  deleteChapter: async (serialId, chapterId) => {
    const response = await api.delete(
      `/trending-serials/${serialId}/chapters/${chapterId}`
    );
    return response.data;
  },

  seedSerials: async (force = true) => {
    const response = await api.post('/trending-serials/seed', { force });
    return response.data;
  },

  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await api.post('/trending-serials/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSubmissions: async () => {
    const response = await api.get('/trending-serials/admin/submissions');
    return response.data;
  },

  actionSubmission: async (id, action, notes = '') => {
    const response = await api.post(`/trending-serials/admin/submissions/${id}/action`, {
      action,
      notes,
    });
    return response.data;
  },

  getContractApplications: async () => {
    const response = await api.get('/contracts/admin/applications');
    return response.data;
  },

  decideContractApplication: async (id, decision, editorReasons = [], editorNote = '') => {
    const response = await api.post(`/contracts/admin/applications/${id}/decision`, {
      decision,
      editorReasons,
      editorNote,
    });
    return response.data;
  },

  getAeAdminData: async () => {
    const response = await api.get('/contracts/admin/ae-data');
    return response.data;
  },
};
