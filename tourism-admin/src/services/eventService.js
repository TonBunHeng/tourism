import api from './api';

export const eventService = {
  async getEvents(params = {}) {
    return await api.get('/events', { params });
  },

  async getEventById(id) {
    return await api.get(`/events/${id}`);
  },

  async createEvent(data) {
    return await api.post('/events', data);
  },

  async updateEvent(id, data) {
    return await api.put(`/events/${id}`, data);
  },

  async deleteEvent(id) {
    return await api.delete(`/events/${id}`);
  }
};

export default eventService;
