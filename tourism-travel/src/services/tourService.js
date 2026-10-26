import api from './api';

export const tourService = {
  /**
   * Fetch active tour packages with search, destination, duration, and sort filters.
   */
  async getTours(params = {}) {
    return await api.get('/tours', { params });
  },

  /**
   * Fetch a single tour package by ID or slug.
   */
  async getTour(id) {
    return await api.get(`/tours/${id}`);
  },
};

export default tourService;
