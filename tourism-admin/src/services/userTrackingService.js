import api from './api';

export const userTrackingService = {
  /**
   * Fetch paginated user tracking activity logs with filters.
   */
  async getLogs(params = {}) {
    return await api.get('/user-tracking', { params });
  },

  /**
   * Fetch aggregate statistics and role distribution.
   */
  async getStatistics() {
    return await api.get('/user-tracking/stats');
  },

  /**
   * Fetch single tracking log details.
   */
  async getLog(id) {
    return await api.get(`/user-tracking/${id}`);
  },

  /**
   * Create a manual tracking / audit entry (Super Admin only).
   */
  async createLog(data) {
    return await api.post('/user-tracking', data);
  },

  /**
   * Update an existing tracking log description or notes (Super Admin only).
   */
  async updateLog(id, data) {
    return await api.put(`/user-tracking/${id}`, data);
  },

  /**
   * Delete a tracking log entry (Super Admin only).
   */
  async deleteLog(id) {
    return await api.delete(`/user-tracking/${id}`);
  },

  /**
   * Bulk clear tracking records (Super Admin only).
   */
  async clearLogs(params = {}) {
    return await api.delete('/user-tracking', { params });
  },

  /**
   * Export tracking audit logs for CSV download.
   */
  async getExportData(params = {}) {
    return await api.get('/user-tracking/export', { params });
  },
};

export default userTrackingService;
