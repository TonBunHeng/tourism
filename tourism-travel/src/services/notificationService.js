import api from './api';

export const notificationService = {
  /**
   * Fetch notifications with optional filtering
   * @param {Object} params - { category, unread_only, search, limit }
   */
  async getNotifications(params = {}) {
    return await api.get('/notifications', { params });
  },

  /**
   * Get unread notifications count for header badge
   */
  async getUnreadCount() {
    return await api.get('/notifications/unread-count');
  },

  /**
   * Mark a single notification as read
   * @param {number|string} id
   */
  async markAsRead(id) {
    return await api.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead() {
    return await api.post('/notifications/mark-all-read');
  },

  /**
   * Delete a single notification
   * @param {number|string} id
   */
  async deleteNotification(id) {
    return await api.delete(`/notifications/${id}`);
  },

  /**
   * Clear all notifications
   */
  async clearAll() {
    return await api.delete('/notifications');
  }
};

export default notificationService;
