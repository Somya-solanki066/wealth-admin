import api from './api';

export const writingVaultService = {
  list(params = {}) {
    return api.get('/data/writing-vault', { params });
  },
  create(payload) {
    return api.post('/data/writing-vault', payload);
  },
  update(id, payload) {
    return api.put(`/data/writing-vault/${id}`, payload);
  },
  remove(id) {
    return api.delete(`/data/writing-vault/${id}`);
  },
  seed() {
    return api.post('/data/writing-vault/seed');
  },
};
