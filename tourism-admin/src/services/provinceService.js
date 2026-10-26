import api from './api';

export const provinceService = {
  async getProvinces(params = {}) {
    return await api.get('/provinces', { params });
  },

  async getProvinceById(id) {
    return await api.get(`/provinces/${id}`);
  },

  async createProvince(data) {
    return await api.post('/provinces', data);
  },

  async updateProvince(id, data) {
    return await api.put(`/provinces/${id}`, data);
  },

  async deleteProvince(id) {
    return await api.delete(`/provinces/${id}`);
  }
};

export default provinceService;
