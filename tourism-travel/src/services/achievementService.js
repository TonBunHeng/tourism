import api from './api';

export const achievementService = {
  async getAchievements(params = {}) {
    return await api.get('/achievements', { params });
  },

  async getMyAchievements(params = {}) {
    return await api.get('/achievements/my', { params });
  },
};

export default achievementService;
