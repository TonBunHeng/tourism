import api from './api';

export const contactService = {
  /**
   * Submit visitor support or travel inquiry.
   */
  async submitInquiry(data) {
    return await api.post('/contact', data);
  },
};

export default contactService;
