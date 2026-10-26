import api from './api';

export const categoryService = {
  async getCategories(params = {}) {
    return await api.get('/categories', { params });
  },

  async getCategoryById(id) {
    return await api.get(`/categories/${id}`);
  },

  async createCategory(data) {
    return await api.post('/categories', data);
  },

  async updateCategory(id, data) {
    return await api.put(`/categories/${id}`, data);
  },

  async deleteCategory(id) {
    return await api.delete(`/categories/${id}`);
  }
};

export default categoryService;
