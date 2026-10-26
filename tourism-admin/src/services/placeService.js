import api from './api';

export const placeService = {
  async getPlaces(params = {}) {
    return await api.get('/places', { params });
  },

  async getPlaceById(id) {
    return await api.get(`/places/${id}`);
  },

  async createPlace(data) {
    return await api.post('/places', data);
  },

  async updatePlace(id, data) {
    return await api.put(`/places/${id}`, data);
  },

  async deletePlace(id) {
    return await api.delete(`/places/${id}`);
  }
};

export default placeService;
