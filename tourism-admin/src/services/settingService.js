import api from './api';

export const settingService = {
  async getSettings(params = {}) {
    return await api.get('/settings', { params });
  },

  async updateSettings(settingsArray) {
    return await api.put('/settings', { settings: settingsArray });
  }
};

export default settingService;
