import api from './api';

export const aiService = {
  chat: async (message, sessionId = null, context = {}) => {
    const response = await api.post('/ai/chat', {
      message,
      session_id: sessionId,
      ...context,
    });
    return response?.data || response;
  },

  getConversations: async (params = {}) => {
    const response = await api.get('/ai/conversations', { params });
    return response.data;
  },

  getMessages: async (sessionId) => {
    const response = await api.get(`/ai/conversations/${sessionId}/messages`);
    return response.data;
  },

  clearConversation: async (sessionId) => {
    const response = await api.delete(`/ai/conversations/${sessionId}`);
    return response.data;
  },

  getWeather: async (province = 'Siem Reap', days = 3) => {
    const response = await api.get('/weather', {
      params: { province, days },
    });
    return response.data;
  },

  getCurrency: async () => {
    const response = await api.get('/currency');
    return response.data;
  },

  convertCurrency: async (amount, from = 'USD', to = 'KHR') => {
    const response = await api.post('/currency/convert', {
      amount,
      from_currency: from,
      to_currency: to,
    });
    return response.data;
  },

  getRecommendations: async (params = {}) => {
    const response = await api.post('/ai/recommendations', params);
    return response.data;
  },

  generateItinerary: async (params = {}) => {
    const response = await api.post('/ai/itineraries', params);
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  },
};

export default aiService;
