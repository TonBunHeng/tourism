import api from './api';

export const userService = {
  async getUsers(params = {}) {
    return await api.get('/users', { params });
  },

  async getUserById(id) {
    return await api.get(`/users/${id}`);
  },

  async createUser(data) {
    return await api.post('/users', data);
  },

  async updateUser(id, data) {
    return await api.put(`/users/${id}`, data);
  },

  async updateUserStatus(id, status) {
    return await api.put(`/users/${id}/status`, { status });
  },

  async getActiveStatusMetrics() {
    return await api.get('/users/active-status');
  },

  async deleteUser(id) {
    return await api.delete(`/users/${id}`);
  }
};

export default userService;
