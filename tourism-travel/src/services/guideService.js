import { api, guideApi } from './api';

export const guideService = {
  // Public Tourist Directory API (/api/travel/guides)
  async getGuides(params = {}) {
    return await api.get('/guides', { params });
  },

  async getGuide(id) {
    return await api.get(`/guides/${id}`);
  },

  async getDashboardStats() {
    return await guideApi.get('/dashboard');
  },

  // Places
  async getPlaces(params = {}) {
    return await guideApi.get('/places', { params });
  },

  async getPlace(id) {
    return await guideApi.get(`/places/${id}`);
  },

  async createPlace(data) {
    const isFormData = data instanceof FormData;
    return await guideApi.post('/places', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  async updatePlace(id, data) {
    const isFormData = data instanceof FormData;
    return await guideApi.put(`/places/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  // Events
  async getEvents(params = {}) {
    return await guideApi.get('/events', { params });
  },

  async getEvent(id) {
    return await guideApi.get(`/events/${id}`);
  },

  async createEvent(data) {
    const isFormData = data instanceof FormData;
    return await guideApi.post('/events', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  async updateEvent(id, data) {
    const isFormData = data instanceof FormData;
    return await guideApi.put(`/events/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  // Galleries / Media
  async getGalleries(params = {}) {
    return await guideApi.get('/galleries', { params });
  },

  async uploadGalleryMedia(data) {
    const isFormData = data instanceof FormData;
    return await guideApi.post('/galleries', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  async deleteGalleryMedia(id) {
    return await guideApi.delete(`/galleries/${id}`);
  },

  // Reviews & Assistance
  async getReviews(params = {}) {
    return await guideApi.get('/reviews', { params });
  },

  async replyReview(id, reply) {
    return await guideApi.post(`/reviews/${id}/reply`, { reply });
  },
};

export default guideService;
