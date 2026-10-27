import api from './api';

export const travelService = {
  // Destinations / Places
  async getPlaces(params = {}) {
    return await api.get('/places', { params });
  },

  async getPlace(id) {
    return await api.get(`/places/${id}`);
  },

  // Categories & Provinces
  async getCategories() {
    return await api.get('/categories');
  },

  async getCategory(id) {
    return await api.get(`/categories/${id}`);
  },

  async getProvinces() {
    return await api.get('/provinces');
  },

  async getProvince(id) {
    return await api.get(`/provinces/${id}`);
  },

  // Events & Festivals
  async getEvents(params = {}) {
    return await api.get('/events', { params });
  },

  async getEvent(id) {
    return await api.get(`/events/${id}`);
  },

  // Tour Packages & Guides
  async getTours(params = {}) {
    return await api.get('/tours', { params });
  },

  async getTour(id) {
    return await api.get(`/tours/${id}`);
  },

  async getGuides(params = {}) {
    return await api.get('/guides', { params });
  },

  async getGuide(id) {
    return await api.get(`/guides/${id}`);
  },

  // Galleries
  async getGalleries(params = {}) {
    return await api.get('/galleries', { params });
  },

  async getGallery(id) {
    return await api.get(`/galleries/${id}`);
  },

  async likeGallery(id) {
    return await api.post(`/galleries/${id}/like`);
  },

  // Directory Businesses
  async getBusinesses(params = {}) {
    return await api.get('/businesses', { params });
  },

  async getBusiness(id) {
    return await api.get(`/businesses/${id}`);
  },

  async getBusinessServices(id) {
    return await api.get(`/businesses/${id}/services`);
  },

  async getBusinessHours(id) {
    return await api.get(`/businesses/${id}/hours`);
  },

  async getBusinessReviews(id) {
    return await api.get(`/businesses/${id}/reviews`);
  },

  async postBusinessReview(id, data) {
    return await api.post(`/businesses/${id}/reviews`, data);
  },

  // Reviews
  async getReviews(params = {}) {
    return await api.get('/reviews', { params });
  },

  async getReview(id) {
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

  // Favorites
  async getFavorites() {
    return await api.get('/favorites');
  },

  async addFavorite(placeId) {
    return await api.post('/favorites', { place_id: placeId });
  },

  async toggleFavorite(placeId) {
    return await api.post(`/favorites/toggle/${placeId}`);
  },

  async removeFavorite(placeId) {
    return await api.delete(`/favorites/${placeId}`);
  },

  async toggleVisited(id) {
    return await api.patch(`/favorites/${id}/toggle-visited`);
  },

  // Bookings (Tourist)
  async getBookings() {
    return await api.get('/bookings');
  },

  async getBooking(id) {
    return await api.get(`/bookings/${id}`);
  },

  async createBooking(data) {
    return await api.post('/bookings', data);
  },

  async createBusinessBooking(businessId, data) {
    return await api.post(`/businesses/${businessId}/bookings`, data);
  },

  async cancelBooking(id, reason = '') {
    return await api.post(`/bookings/${id}/cancel`, { cancellation_reason: reason });
  },

  // Trip Planner
  async getTrips() {
    return await api.get('/trips');
  },

  async getTrip(id) {
    return await api.get(`/trips/${id}`);
  },

  async createTrip(data) {
    return await api.post('/trips', data);
  },

  async updateTrip(id, data) {
    return await api.put(`/trips/${id}`, data);
  },

  async deleteTrip(id) {
    return await api.delete(`/trips/${id}`);
  },

  // App Settings & Emergency Contacts
  async getSettings() {
    return await api.get('/settings');
  },

  // Support / Inquiries
  async sendContact(data) {
    return await api.post('/contact', data);
  },

  // Privacy / Deletion Requests
  async getDeletionRequests() {
    return await api.get('/deletion-requests');
  },

  async createDeletionRequest(data) {
    return await api.post('/deletion-requests', data);
  },
};

export default travelService;
