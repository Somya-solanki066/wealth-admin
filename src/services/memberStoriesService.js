import api from './api';

export const memberStoriesService = {
  getStories: async () => {
    const response = await api.get('/member-stories');
    return response.data;
  },

  getStory: async (id) => {
    const response = await api.get(`/member-stories/${id}`);
    return response.data;
  },

  createStory: async (data) => {
    const response = await api.post('/member-stories', data);
    return response.data;
  },

  updateStory: async (id, data) => {
    const response = await api.put(`/member-stories/${id}`, data);
    return response.data;
  },

  deleteStory: async (id) => {
    const response = await api.delete(`/member-stories/${id}`);
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/member-stories/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
