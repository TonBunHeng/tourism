import api from './api';

export const reportService = {
  async getAnalytics(params = {}) {
    const res = await api.get('/reports/analytics', { params });
    return res;
  }
};

export default reportService;
