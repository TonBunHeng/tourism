import api from './api';

export const bookingService = {
  async getBookings(params = {}) {
    return await api.get('/bookings', { params });
  },

  async getBooking(id) {
    return await api.get(`/bookings/${id}`);
  },

  async updateStatus(id, status, reason = '') {
    return await api.put(`/bookings/${id}/status`, { 
      status, 
      rejection_reason: reason 
    });
  },

  async deleteBooking(id) {
    return await api.delete(`/bookings/${id}`);
  },
};

export default bookingService;
