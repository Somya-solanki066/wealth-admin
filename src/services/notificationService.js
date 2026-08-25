import api from './api';

export const notificationService = {
  getAllNotifications: async (page = 1, limit = 50) => {
    const response = await api.get('/notifications', {
      params: { page, limit }
    });
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

