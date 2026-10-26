import api from './api';

export const tourService = {
  /**
   * Fetch all tour packages for administration.
   */
  async getTours(params = {}) {
    return await api.get('/tours', { params });
  },

  /**
   * Fetch single tour package details.
   */
  async getTour(id) {
    return await api.get(`/tours/${id}`);
  },

  /**
   * Create a new tour package.
   */
  async createTour(data) {
    return await api.post('/tours', data);
  },

  /**
   * Update an existing tour package.
   */
  async updateTour(id, data) {
    return await api.put(`/tours/${id}`, data);
  },

  /**
   * Toggle tour package status (active / draft).
   */
  async toggleStatus(id) {
    return await api.post(`/tours/${id}/toggle-status`);
  },

  /**
   * Delete a tour package.
   */
  async deleteTour(id) {
    return await api.delete(`/tours/${id}`);
  },
};

export default tourService;
