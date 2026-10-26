import api from './api';

export const reviewService = {
  async getReviews(params = {}) {
    return await api.get('/reviews', { params });
  },

  async getAnalytics(params = {}) {
    return await api.get('/reviews/analytics', { params });
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

  async updateReviewStatus(id, status) {
    return await api.put(`/reviews/${id}/status`, { status });
  },

  async addReply(reviewId, comment) {
    return await api.post(`/reviews/${reviewId}/replies`, { comment });
  },

  async replyToReview(reviewId, data) {
    const comment = typeof data === 'object' ? data.comment : data;
    return await api.post(`/reviews/${reviewId}/replies`, { comment });
  },

  async deleteReview(id) {
    return await api.delete(`/reviews/${id}`);
  }
};

export default reviewService;
