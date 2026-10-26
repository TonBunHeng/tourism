import api from './api';

export const categoryService = {
  async getCategories(params = {}) {
    return await api.get('/categories', { params });
  },

  async getCategoryById(id) {
    return await api.get(`/categories/${id}`);
  },
};

export default categoryService;
