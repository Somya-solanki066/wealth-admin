// Test API connection utility
export const testConnection = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_URL.replace('/api', '')}/api/auth/test-cookie`, {
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
      details: 'Make sure backend server is running on http://localhost:5000'
    };
  }
};

