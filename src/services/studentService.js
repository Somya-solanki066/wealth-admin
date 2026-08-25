import api from './api';

export const studentService = {
  getStudentProfile: async (userId) => {
    const response = await api.get(`/students/${userId}`);
    return response.data;
  },
};

