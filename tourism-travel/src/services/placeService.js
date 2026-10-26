import api from './api';

export const placeService = {
  async getPlaces(params = {}) {
    return await api.get('/places', { params });
  },

  async getPlaceById(id) {
    return await api.get(`/places/${id}`);
  },
};

export default placeService;
