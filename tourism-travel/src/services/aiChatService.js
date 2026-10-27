import api from './api';

export const aiChatService = {
  // Send chat message
  async sendMessage({ message, sessionId = null, province = null, category = null, language = 'en' }) {
    return await api.post('/ai/chat', {
      message,
      session_id: sessionId,
      province,
      category,
      language,
    });
  },

  // Conversation history
  async getConversations() {
    return await api.get('/ai/conversations');
  },

  async getConversationMessages(sessionId) {
    return await api.get(`/ai/conversations/${sessionId}/messages`);
  },

  async deleteConversation(sessionId) {
    return await api.delete(`/ai/conversations/${sessionId}`);
  },

  // Smart Recommendations
  async getRecommendations(params) {
    return await api.post('/ai/recommendations', params);
  },

  // Day-by-Day Itineraries
  async generateItinerary(params) {
    return await api.post('/ai/itineraries', params);
  },

  // Real-time Weather
  async getWeather(province = 'Siem Reap', days = 3) {
    return await api.get('/ai/weather', { params: { province, days } });
  },

  // Currency
  async getCurrencyRate() {
    return await api.get('/ai/currency');
  },

  async convertCurrency(amount, from = 'USD', to = 'KHR') {
    return await api.post('/ai/currency/convert', {
      amount,
      from_currency: from,
      to_currency: to,
    });
  },

  // Transport estimator
  async getTransportEstimate(origin, destination, travelers = 1) {
    return await api.get('/ai/transport', {
      params: { origin, destination, travelers },
    });
  },

  // AI Service health status
  async getStatus() {
    return await api.get('/ai/status');
  },
};

export default aiChatService;
