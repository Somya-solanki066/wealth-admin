import api from './api';

export const aboutService = {
  getAbout: async () => {
    const response = await api.get('/about-ink2wealth');
    return response.data?.data || response.data;
  },

  updateAbout: async (data) => {
    const response = await api.put('/about-ink2wealth', data);
    return response.data?.data || response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/about-ink2wealth/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
