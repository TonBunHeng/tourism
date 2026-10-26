import api from './api';

export const reviewService = {
  async getReviews(params = {}) {
    return await api.get('/reviews', { params });
  },

  async getReviewById(id) {
    return await api.get(`/reviews/${id}`);
  },

  async createReview(data) {
    return await api.post('/reviews', data);
  },

  async updateReview(id, data) {
    return await api.put(`/reviews/${id}`, data);
  },

  async deleteReview(id) {
    return await api.delete(`/reviews/${id}`);
  },
};

export default reviewService;
