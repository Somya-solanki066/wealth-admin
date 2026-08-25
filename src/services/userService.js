import api from './api';

export const userService = {
  getAllUsers: async (page = 1, limit = 20) => {
    const response = await api.get('/data/users', {
      params: { page, limit }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/data/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/data/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/data/users/${id}`);
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get('/data/search', {
      params: { q: query }
    });
    return response.data;
  },

  getDashboardData: async () => {
    const response = await api.get('/data/admin');
    return response.data;
  },
};

