import api from './api';

export const settingService = {
  async getSettings() {
    return await api.get('/settings');
  },
};

export default settingService;
