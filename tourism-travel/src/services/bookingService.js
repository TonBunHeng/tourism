import { api, businessApi } from './api';

export const bookingService = {
  // Tourist / Travel User Booking Operations (/api/travel/*)
  async createBooking(data) {
    return await api.post('/bookings', data);
  },

  async getMyBookings(params = {}) {
    return await api.get('/bookings', { params });
  },

  async getBookingDetails(id) {
    return await api.get(`/bookings/${id}`);
  },

  async cancelBooking(id, cancellationReason = '') {
    return await api.post(`/bookings/${id}/cancel`, {
      cancellation_reason: cancellationReason,
    });
  },

  // Business Owner Booking Operations (/api/business/*)
  async getOwnerBookings(params = {}) {
    return await businessApi.get('/bookings', { params });
  },

  async getBusinessBookings(businessId, params = {}) {
    return await businessApi.get(`/businesses/${businessId}/bookings`, { params });
  },

  async getBookingStatistics(params = {}) {
    return await businessApi.get('/bookings/statistics', { params });
  },

  async getOwnerBookingDetails(id) {
    return await businessApi.get(`/bookings/${id}`);
  },

  async confirmBooking(id) {
    return await businessApi.post(`/bookings/${id}/confirm`);
  },

  async rejectBooking(id, rejectionReason = '') {
    return await businessApi.post(`/bookings/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
  },

  async completeBooking(id, paymentStatus = 'paid') {
    return await businessApi.post(`/bookings/${id}/complete`, {
      payment_status: paymentStatus,
    });
  },

  async updateBookingStatus(id, data) {
    return await businessApi.patch(`/bookings/${id}/status`, data);
  },
};

export default bookingService;
