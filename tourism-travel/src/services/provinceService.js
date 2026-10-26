import api from './api';

export const provinceService = {
  async getProvinces(params = {}) {
    return await api.get('/provinces', { params });
  },

  async getProvinceById(id) {
    return await api.get(`/provinces/${id}`);
  },
};

export default provinceService;
