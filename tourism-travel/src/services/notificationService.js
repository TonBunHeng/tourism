import api from './api';

export const notificationService = {
  async getNotifications(params = {}) {
    return await api.get('/notifications', { params });
  },

  async getUnreadCount() {
    return await api.get('/notifications/unread-count');
  },

  async markAsRead(id) {
    return await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return await api.patch('/notifications/read-all');
  },

  async deleteNotification(id) {
    return await api.delete(`/notifications/${id}`);
  },

  async getSettings() {
    return await api.get('/notifications/settings');
  },

  async updateSettings(data) {
    return await api.put('/notifications/settings', data);
  },
};

export default notificationService;
