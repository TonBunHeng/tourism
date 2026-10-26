import api from './api';

export const deletionRequestService = {
  async getRequests(params = {}) {
    return await api.get('/deletion-requests', { params });
  },

  async getAnalytics(params = {}) {
    return await api.get('/deletion-requests/analytics', { params });
  },

  async getRequestById(id) {
    return await api.get(`/deletion-requests/${id}`);
  },

  async createRequest(data) {
    return await api.post('/deletion-requests', data);
  },

  async updateStatus(id, data) {
    return await api.put(`/deletion-requests/${id}/status`, data);
  }
};

export default deletionRequestService;
