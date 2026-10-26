import api from './api';

export const galleryService = {
  async getGalleries(params = {}) {
    return await api.get('/galleries', { params });
  },

  async getMedia(params = {}) {
    return await api.get('/galleries', { params });
  },

  async getMediaById(id) {
    return await api.get(`/galleries/${id}`);
  },

  async uploadMedia(data) {
    return await api.post('/galleries', data);
  },

  async createMedia(data) {
    return await api.post('/galleries', data);
  },

  async updateMedia(id, data) {
    return await api.put(`/galleries/${id}`, data);
  },

  async deleteMedia(id) {
    return await api.delete(`/galleries/${id}`);
  }
};

export default galleryService;
