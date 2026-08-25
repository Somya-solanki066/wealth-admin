import api from './api';

export const teacherService = {
  getTeacherProfile: async (userId) => {
    const response = await api.get(`/teachers/${userId}`);
    return response.data;
  },
};

