import api from './api';

export const messageService = {
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  getMessages: async (conversationId, limit = 50) => {
    const response = await api.get(`/messages/conversation/${conversationId}`, {
      params: { limit }
    });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
};

