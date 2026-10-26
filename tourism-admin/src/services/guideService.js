import api from './api';

export const guideService = {
  /**
   * Fetch all tour guides with search and filters.
   */
  async getGuides(params = {}) {
    return await api.get('/guides', { params });
  },

  /**
   * Fetch single guide details.
   */
  async getGuide(id) {
    return await api.get(`/guides/${id}`);
  },

  /**
   * Create a new accredited tour guide account.
   */
  async createGuide(data) {
    return await api.post('/guides', data);
  },

  /**
   * Update tour guide details.
   */
  async updateGuide(id, data) {
    return await api.put(`/guides/${id}`, data);
  },

  /**
   * Delete tour guide account.
   */
  async deleteGuide(id) {
    return await api.delete(`/guides/${id}`);
  },
};

export default guideService;
