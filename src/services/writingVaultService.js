import api from './api';

export const writingVaultService = {
  // Existing prompt library methods
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

  // Hub section management (sparks, contests, motion, games, ticker)
  getHubSection(section) {
    return api.get(`/data/writing-vault/hub/${section}`);
  },
  createHubItem(section, payload) {
    return api.post(`/data/writing-vault/hub/${section}`, payload);
  },
  updateHubItem(section, id, payload) {
    return api.put(`/data/writing-vault/hub/${section}/${id}`, payload);
  },
  deleteHubItem(section, id) {
    return api.delete(`/data/writing-vault/hub/${section}/${id}`);
  },
  seedHub() {
    return api.post('/data/writing-vault/hub/seed');
  },
};
