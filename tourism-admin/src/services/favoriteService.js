import api from './api';

export const favoriteService = {
  async getFavorites(params = {}) {
    return await api.get('/favorites', { params });
  },

  async getAnalytics(params = {}) {
    return await api.get('/favorites/analytics', { params });
  },

  async addFavorite(placeIdOrData, visited = false) {
    const payload = typeof placeIdOrData === 'object' && placeIdOrData !== null
      ? placeIdOrData
      : { place_id: placeIdOrData, visited };
    return await api.post('/favorites', payload);
  },

  async removeFavorite(placeId) {
    return await api.delete(`/favorites/${placeId}`);
  },

  async toggleVisited(id) {
    return await api.patch(`/favorites/${id}/toggle-visited`);
  }
};

export default favoriteService;
