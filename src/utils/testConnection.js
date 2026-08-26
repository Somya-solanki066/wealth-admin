import { getApiUrl } from '../config/api';

export const testConnection = async () => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/auth/test-cookie`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      return { success: true, message: 'Connected to API' };
    } else {
      return { success: false, message: `API responded with status: ${response.status}` };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Cannot connect to API: ${error.message}`,
      details: `Make sure backend is reachable at ${API_URL}`
    };
  }
};
