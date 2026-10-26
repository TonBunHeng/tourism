import api from './api';

export const tripService = {
  getTrips: async (params = {}) => {
    const response = await api.get('/trips', { params });
    return response.data;
  },

  getTripById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  createTrip: async (data) => {
    const response = await api.post('/trips', data);
    return response.data;
  },

  updateTrip: async (id, data) => {
    const response = await api.put(`/trips/${id}`, data);
    return response.data;
  },

  deleteTrip: async (id) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  duplicateTrip: async (id) => {
    const response = await api.post(`/trips/${id}/duplicate`);
    return response.data;
  },

  addItinerary: async (id, item) => {
    const response = await api.post(`/trips/${id}/itineraries`, item);
    return response.data;
  },

  deleteItinerary: async (id, itineraryId) => {
    const response = await api.delete(`/trips/${id}/itineraries/${itineraryId}`);
    return response.data;
  },

  reorderItineraries: async (id, items) => {
    const response = await api.post(`/trips/${id}/reorder`, { items });
    return response.data;
  },
};

export default tripService;
