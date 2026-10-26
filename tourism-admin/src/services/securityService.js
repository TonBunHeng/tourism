import api from './api';

export const securityService = {
  async getAlerts(params = {}) {
    return await api.get('/security-alerts', { params });
  },

  async getLoginAttempts(params = {}) {
    return await api.get('/security-alerts/login-attempts', { params });
  },

  async getBlockedIps() {
    return await api.get('/security-alerts/blocked-ips');
  },

  async blockIp(ip_address, reason = '') {
    return await api.post('/security-alerts/block-ip', { ip_address, reason });
  },

  async unblockIp(ip_address) {
    return await api.post('/security-alerts/unblock-ip', { ip_address });
  },

  async markAsRead(id) {
    return await api.put(`/security-alerts/${id}/read`);
  },

  async markAllRead() {
    return await api.post('/security-alerts/mark-all-read');
  },

  async deleteAlert(id) {
    return await api.delete(`/security-alerts/${id}`);
  },

  async clearAllAlerts() {
    return await api.delete('/security-alerts');
  },

  async getExportData() {
    return await api.get('/security-alerts/export');
  }
};

export default securityService;
