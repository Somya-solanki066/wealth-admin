import axios from 'axios';
import { getApiUrl } from '../config/api';

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isLoginRequest = requestUrl.includes('/auth/email-login');
    const alreadyOnLogin =
      typeof window !== 'undefined' && window.location.pathname.includes('/login');

    // Never hard-reload on login 401 — that wipes the error message.
    // Only clear session and send to login for authenticated API calls.
    if (status === 401 && !isLoginRequest && !alreadyOnLogin) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

