import api from './api';

export const eventService = {
  async getEvents(params = {}) {
    return await api.get('/events', { params });
  },

  async getEventById(id) {
    return await api.get(`/events/${id}`);
  },
};

export default eventService;
