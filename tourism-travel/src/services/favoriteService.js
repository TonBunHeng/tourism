import api from './api';

export const favoriteService = {
  async getFavorites(params = {}) {
    return await api.get('/favorites', { params });
  },

  async addFavorite(data) {
    return await api.post('/favorites', data);
  },

  async removeFavorite(placeId) {
    return await api.delete(`/favorites/${placeId}`);
  },

  async toggleVisited(id) {
    return await api.patch(`/favorites/${id}/toggle-visited`);
  },
};

export default favoriteService;
