import api from './api';

export const authService = {
  login: async (email, password) => {
    // Use email-login endpoint specifically for admin panel (checks admin role)
    const response = await api.post('/auth/email-login', { email, password });
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

