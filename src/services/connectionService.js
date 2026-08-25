import api from './api';

export const connectionService = {
  getAllConnections: async (userId) => {
    const response = await api.get(`/connections/${userId}`);
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/connections/pending');
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/connections/sent');
    return response.data;
  },
};

