import api from './api';

export const dashboardService = {
  async getStats(timeRange = 'weekly') {
    return await api.get('/dashboard/stats', {
      params: { range: timeRange, time_range: timeRange }
    });
  }
};

export default dashboardService;
