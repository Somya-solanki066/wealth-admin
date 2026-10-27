import api from './api';

export const subjectHubService = {
  getAll() {
    return api.get('/data/subject-hubs');
  },
  create(payload) {
    return api.post('/data/subject-hubs', payload);
  },
  update(id, payload) {
    return api.put(`/data/subject-hubs/${id}`, payload);
  },
  delete(id) {
    return api.delete(`/data/subject-hubs/${id}`);
  },
  seed() {
    return api.post('/data/subject-hubs/seed');
  },
};
