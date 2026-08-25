// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getApiUrl = () => API_BASE_URL;

export default {
  baseURL: API_BASE_URL,
  timeout: 10000,
};

