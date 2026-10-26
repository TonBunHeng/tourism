import api from './api';

export const businessService = {
  getAll: (params) => api.get('/businesses', { params }),
  getAdminAll: (params) => api.get('/admin/businesses', { params }),
  getById: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
  approve: (id) => api.post(`/businesses/${id}/approve`),
  reject: (id, data) => api.post(`/businesses/${id}/reject`, data),
  suspend: (id, data) => api.post(`/businesses/${id}/suspend`, data),
  activate: (id) => api.post(`/businesses/${id}/activate`),
};

export default businessService;
