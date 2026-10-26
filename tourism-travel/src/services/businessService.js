import { api, businessApi } from './api';

export const businessService = {
  // Public Tourist Business Discovery
  async getBusinesses(params = {}) {
    return await api.get('/businesses', { params });
  },

  async getBusinessById(id) {
    return await api.get(`/businesses/${id}`);
  },

  async getBusinessServices(id) {
    return await api.get(`/businesses/${id}/services`);
  },

  async getBusinessHours(id) {
    return await api.get(`/businesses/${id}/hours`);
  },

  async getBusinessGallery(id) {
    return await api.get(`/businesses/${id}/gallery`);
  },

  async getBusinessPromotions(id) {
    return await api.get(`/businesses/${id}/promotions`);
  },

  async getBusinessEvents(id) {
    return await api.get(`/businesses/${id}/events`);
  },

  async getBusinessReviews(id, params = {}) {
    return await api.get(`/businesses/${id}/reviews`, { params });
  },

  async storeReview(id, data) {
    return await api.post(`/businesses/${id}/reviews`, data);
  },

  // Business Owner Management Endpoints (/api/business/*)
  async getOwnerProfile() {
    return await businessApi.get('/profile');
  },

  async getOwnerBusinesses(params = {}) {
    return await businessApi.get('/businesses', { params });
  },

  async createBusiness(data) {
    return await businessApi.post('/businesses', data);
  },

  async getOwnerBusiness(id) {
    return await businessApi.get(`/businesses/${id}`);
  },

  async updateBusiness(id, data) {
    return await businessApi.put(`/businesses/${id}`, data);
  },

  async deleteBusiness(id) {
    return await businessApi.delete(`/businesses/${id}`);
  },

  // Images
  async getImages(id) {
    return await businessApi.get(`/businesses/${id}/images`);
  },

  async uploadImage(id, formData) {
    return await businessApi.post(`/businesses/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteImage(id, imageId) {
    return await businessApi.delete(`/businesses/${id}/images/${imageId}`);
  },

  // Services
  async getServices(id) {
    return await businessApi.get(`/businesses/${id}/services`);
  },

  async createService(id, data) {
    return await businessApi.post(`/businesses/${id}/services`, data);
  },

  async updateService(id, serviceId, data) {
    return await businessApi.put(`/businesses/${id}/services/${serviceId}`, data);
  },

  async deleteService(id, serviceId) {
    return await businessApi.delete(`/businesses/${id}/services/${serviceId}`);
  },

  // Hours
  async getHours(id) {
    return await businessApi.get(`/businesses/${id}/hours`);
  },

  async updateHours(id, hours) {
    return await businessApi.put(`/businesses/${id}/hours`, { hours });
  },

  // Promotions
  async getPromotions(id) {
    return await businessApi.get(`/businesses/${id}/promotions`);
  },

  async createPromotion(id, data) {
    const isFormData = data instanceof FormData;
    return await businessApi.post(`/businesses/${id}/promotions`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  async updatePromotion(id, promoId, data) {
    const isFormData = data instanceof FormData;
    return await businessApi.put(`/businesses/${id}/promotions/${promoId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  async deletePromotion(id, promoId) {
    return await businessApi.delete(`/businesses/${id}/promotions/${promoId}`);
  },

  // Reviews & Replies
  async getReviews(id, params = {}) {
    return await businessApi.get(`/businesses/${id}/reviews`, { params });
  },

  async replyReview(id, reviewId, reply) {
    return await businessApi.post(`/businesses/${id}/reviews/${reviewId}/reply`, { reply });
  },

  // Analytics & Events
  async getStatistics(id) {
    return await businessApi.get(`/businesses/${id}/statistics`);
  },

  async getEvents(id) {
    return await businessApi.get(`/businesses/${id}/events`);
  },

  async createEvent(id, data) {
    return await businessApi.post(`/businesses/${id}/events`, data);
  },

  // Business Performance Reports & CSV/JSON Export (/api/business/reports*)
  async getReports(params = {}) {
    return await businessApi.get('/reports', { params });
  },

  async getBusinessReport(id, params = {}) {
    return await businessApi.get(`/businesses/${id}/reports`, { params });
  },

  async exportReport(params = {}) {
    const format = params.format || 'csv';
    if (format === 'json') {
      return await businessApi.get('/reports/export', { params });
    }
    return await businessApi.get('/reports/export', {
      params,
      responseType: 'blob',
    });
  },

  async exportBusinessReport(id, params = {}) {
    const format = params.format || 'csv';
    if (format === 'json') {
      return await businessApi.get(`/businesses/${id}/reports/export`, { params });
    }
    return await businessApi.get(`/businesses/${id}/reports/export`, {
      params,
      responseType: 'blob',
    });
  },
};

export default businessService;
