import axios from 'axios';
import { BUSINESS_API_URL, sanitizeErrorMessage } from './api';

const businessApi = axios.create({
  baseURL: BUSINESS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

businessApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

businessApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('user-profile-updated'));

      return Promise.reject({
        success: false,
        message: 'Your session has expired. Please sign in again.',
        status: 401,
      });
    }

    if (status === 403) {
      const sanitized = sanitizeErrorMessage(responseData?.message, 403);
      return Promise.reject({
        success: false,
        message: sanitized,
        status: 403,
      });
    }

    if (responseData) {
      const sanitizedMessage = sanitizeErrorMessage(
        responseData.message || responseData.error || responseData.errors,
        status
      );
      return Promise.reject({
        success: false,
        message: sanitizedMessage,
        errors: responseData.errors || null,
        status,
        data: responseData,
      });
    }

    return Promise.reject({
      success: false,
      message: error.message || 'Network error connecting to Business API.',
      status: 0,
    });
  }
);

export const businessOwnerService = {
  // Business Profile & Overview
  async getProfile() {
    return await businessApi.get('/profile');
  },

  async getBusinesses(params = {}) {
    return await businessApi.get('/businesses', { params });
  },

  async getBusiness(id) {
    return await businessApi.get(`/businesses/${id}`);
  },

  async createBusiness(data) {
    return await businessApi.post('/businesses', data);
  },

  async updateBusiness(id, data) {
    return await businessApi.put(`/businesses/${id}`, data);
  },

  async deleteBusiness(id) {
    return await businessApi.delete(`/businesses/${id}`);
  },

  // Photos & Gallery
  async getImages(businessId) {
    return await businessApi.get(`/businesses/${businessId}/images`);
  },

  async uploadImage(businessId, formData) {
    return await businessApi.post(`/businesses/${businessId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteImage(businessId, imageId) {
    return await businessApi.delete(`/businesses/${businessId}/images/${imageId}`);
  },

  // Services / Offerings CRUD
  async getServices(businessId) {
    return await businessApi.get(`/businesses/${businessId}/services`);
  },

  async createService(businessId, data) {
    return await businessApi.post(`/businesses/${businessId}/services`, data);
  },

  async updateService(businessId, serviceId, data) {
    return await businessApi.put(`/businesses/${businessId}/services/${serviceId}`, data);
  },

  async deleteService(businessId, serviceId) {
    return await businessApi.delete(`/businesses/${businessId}/services/${serviceId}`);
  },

  // Operating Hours
  async getHours(businessId) {
    return await businessApi.get(`/businesses/${businessId}/hours`);
  },

  async updateHours(businessId, hours) {
    return await businessApi.put(`/businesses/${businessId}/hours`, { hours });
  },

  // Promotions & Special Offers
  async getPromotions(businessId) {
    return await businessApi.get(`/businesses/${businessId}/promotions`);
  },

  async createPromotion(businessId, data) {
    return await businessApi.post(`/businesses/${businessId}/promotions`, data);
  },

  async updatePromotion(businessId, promoId, data) {
    return await businessApi.put(`/businesses/${businessId}/promotions/${promoId}`, data);
  },

  async deletePromotion(businessId, promoId) {
    return await businessApi.delete(`/businesses/${businessId}/promotions/${promoId}`);
  },

  // Customer Reviews & Replies
  async getReviews(businessId) {
    return await businessApi.get(`/businesses/${businessId}/reviews`);
  },

  async replyReview(businessId, reviewId, reply) {
    return await businessApi.post(`/businesses/${businessId}/reviews/${reviewId}/reply`, { reply });
  },

  // Business Statistics
  async getStatistics(businessId) {
    return await businessApi.get(`/businesses/${businessId}/statistics`);
  },

  // Bookings Management
  async getBookings(params = {}) {
    return await businessApi.get('/bookings', { params });
  },

  async getBookingStatistics() {
    return await businessApi.get('/bookings/statistics');
  },

  async getBusinessBookings(businessId, params = {}) {
    return await businessApi.get(`/businesses/${businessId}/bookings`, { params });
  },

  async getBooking(id) {
    return await businessApi.get(`/bookings/${id}`);
  },

  async confirmBooking(id) {
    return await businessApi.post(`/bookings/${id}/confirm`);
  },

  async rejectBooking(id, rejectionReason = '') {
    return await businessApi.post(`/bookings/${id}/reject`, { rejection_reason: rejectionReason });
  },

  async completeBooking(id) {
    return await businessApi.post(`/bookings/${id}/complete`);
  },

  async updateBookingStatus(id, status, paymentStatus = null) {
    const payload = { status };
    if (paymentStatus) payload.payment_status = paymentStatus;
    return await businessApi.patch(`/bookings/${id}/status`, payload);
  },

  // Reports & Financial Analytics
  async getReports(params = {}) {
    return await businessApi.get('/reports', { params });
  },

  async getBusinessReports(businessId, params = {}) {
    return await businessApi.get(`/businesses/${businessId}/reports`, { params });
  },

  async exportReportsCsv(params = {}) {
    const response = await businessApi.get('/reports/export', {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });

    const blob = response instanceof Blob
      ? response
      : new Blob([response], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `business_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
};

export default businessOwnerService;
