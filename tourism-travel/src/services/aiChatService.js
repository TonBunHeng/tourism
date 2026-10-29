import axios from 'axios';
import api, { AI_CHAT_SERVICE_URL } from './api';
import { formatSuggestedTopic, getLocalDynamicSuggestions } from '../utils/chatUtils';

// Direct axios client for the dedicated aichatbot microservice (Port 8001)
export const aiBotClient = axios.create({
  baseURL: AI_CHAT_SERVICE_URL, // e.g. http://127.0.0.1:8001
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

/**
 * Intelligent local fallback knowledge when both aichatbot (8001) 
 * and Laravel backend (8000) are temporarily offline or starting up.
 */
function getLocalFallbackReply(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('sunrise') || msg.includes('sunset') || msg.includes('dawn')) {
    return {
      reply: `**Angkor Wat Sunrise & Sunset Guide**:\n\n* **Sunrise**: The premier vantage point is by the **Northern Reflecting Pond** (left of the main causeway). Arrive between **5:00 AM – 5:15 AM** for the iconic reflection photo.\n* **Pass Requirement**: Buy your Angkor Pass online or the afternoon prior so you bypass ticket booths in the morning.\n* **Sunset**: **Phnom Bakheng** offers sunset views over the temple canopy (capped at 300 visitors; arrive by 4:00 PM). Excellent uncrowded alternatives are **Pre Rup** and **Srah Srang**.`,
      suggestions: [
        'What is the ticket price for Angkor Pass?',
        'What is the temple dress code?',
        'How do I hire a tuk-tuk for sunrise?'
      ]
    };
  }

  if (msg.includes('dress') || msg.includes('wear') || msg.includes('etiquette') || msg.includes('clothes') || msg.includes('code')) {
    return {
      reply: `**Temple Dress Code & Sacred Etiquette**:\n\n* **Shoulders & Knees Covered**: Both men and women must wear clothing covering shoulders and extending below the knees.\n* **Restricted**: Sleeveless shirts, tank tops, and short shorts are strictly prohibited past checkpoints.\n* **Footwear**: Sturdy walking shoes or hiking sandals for ancient sandstone steps.\n* **Sanctuaries**: Hats and sunglasses must be removed inside inner tower sanctums.\n* **Monks**: Never touch a Buddhist monk, and never point your feet directly at Buddha images.`,
      suggestions: [
        'When is the best time for Angkor sunrise?',
        'What are the best boutique hotels in Siem Reap?',
        'How do PassApp and Tuk-Tuks work?'
      ]
    };
  }

  if (msg.includes('ticket') || msg.includes('pass') || msg.includes('fee') || msg.includes('price') || msg.includes('cost')) {
    return {
      reply: `**Official Angkor Pass Pricing (2026)**:\n\n* **1-Day Pass**: **$37 USD** (Valid on date of issue)\n* **3-Day Pass**: **$62 USD** (Valid any 3 days within a 10-day window)\n* **7-Day Pass**: **$72 USD** (Valid any 7 days within a 1-month window)\n* **Children under 12**: **Free** admission (present passport copy).\n\n**Where to purchase**: Buy at the official Angkor Enterprise ticket center on Apsara Road (4:30 AM – 5:30 PM) or online via **angkorenterprise.gov.kh**.`,
      suggestions: [
        'Recommend a 3-day Siem Reap itinerary',
        'What traditional Khmer foods should I try?',
        'Are there boutique resorts near Angkor?'
      ]
    };
  }

  if (msg.includes('hotel') || msg.includes('resort') || msg.includes('stay') || msg.includes('accommodation')) {
    return {
      reply: `**Recommended Accommodations in Siem Reap**:\n\n* **Heritage Luxury**: *Raffles Grand Hotel d'Angkor* (French colonial charm since 1932) and *Amansara* (former royal guest villa).\n* **Boutique Eco-Resorts**: *Phum Baitang* (wooden stilt pavilions nestled in green paddy fields) and *Shinta Mani Angkor* (designed by Bill Bensley).\n* **Chic Mid-Range**: *Treeline Urban Resort* (riverside art hotel in Wat Bo) and *Viroth's Hotel* (lush 1950s retro-modern sanctuary with saltwater pool).\n\n**Tip**: Staying around the **Wat Bo** or **French Quarter** gives walking access to riverside cafes while being just a 15-minute tuk-tuk ride from the Angkor temples.`,
      suggestions: [
        'What authentic Khmer dishes should I try?',
        'How do Tuk-Tuks and PassApp rides work?',
        'How to spend a 3-day itinerary in Angkor?'
      ]
    };
  }

  if (msg.includes('itinerary') || msg.includes('3-day') || msg.includes('plan') || msg.includes('trip')) {
    return {
      reply: `**Recommended 3-Day Angkor & Siem Reap Itinerary**:\n\n* **Day 1 (Small Circuit Core)**: 5:00 AM Angkor Wat sunrise → Bayon & Angkor Thom smiling stone faces → Ta Keo → Ta Prohm ("Tomb Raider" jungle roots) → Evening Khmer dinner at Wat Bo.\n* **Day 2 (Grand Circuit & Culture)**: Preah Khan monastery → Neak Pean water island → East Mebon → Sunset over Pre Rup pyramid → Night market & Phare Cambodian Circus.\n* **Day 3 (Outer Jewels & Nature)**: Intricate pink sandstone carvings at Banteay Srei → Cambodia Landmine Museum → Afternoon boat cruise along Tonle Sap floating village (Kampong Phluk).`,
      suggestions: [
        'What is the ticket price for Angkor Pass?',
        'What is the temple dress code?',
        'What authentic Khmer foods should I not miss?'
      ]
    };
  }

  if (msg.includes('food') || msg.includes('eat') || msg.includes('dish') || msg.includes('cuisine') || msg.includes('restaurant')) {
    return {
      reply: `**Top Authentic Cambodian Dishes to Try**:\n\n* **Fish Amok (អាម៉ុកត្រី)**: Steamed freshwater fish soufflé infused with kroeung paste, coconut cream, and noni leaves, cooked in a banana-leaf basket.\n* **Beef Lok Lak (ឡុកឡាក់សាច់គោ)**: Sautéed tender beef cubes served with red onions, tomatoes, and the quintessential lime & Kampot black pepper dipping sauce.\n* **Nom Banh Chok (នំបញ្ចុក)**: Traditional Khmer breakfast rice noodles bathed in green fish lemongrass curry broth and heaped with wild river greens.\n* **Kuy Teav (គុយទាវ)**: Fragrant pork and seafood bone broth noodle soup garnished with fried garlic and cilantro.`,
      suggestions: [
        'Are there boutique resorts in Siem Reap?',
        'What is the currency exchange between USD and KHR?',
        'When is the best time for Angkor Wat sunrise?'
      ]
    };
  }

  if (msg.includes('transit') || msg.includes('flight') || msg.includes('airport') || msg.includes('tuk') || msg.includes('passapp') || msg.includes('grab')) {
    return {
      reply: `**Cambodia Transportation & Airport Transit Guide**:\n\n* **Ride-Hailing Apps**: Download **PassApp** or **Grab** on arrival. Both provide metered, upfront pricing without haggling.\n* **Siem Reap–Angkor Airport (SAI)**: Located 45 km from town. Official airport bus ($8 USD), shared van ($9 USD), or private taxi ($35 USD).\n* **Phnom Penh Airport (PNH)**: An auto-rickshaw/tuk-tuk to the city center costs around **$6 – $10 USD** via PassApp or Grab.\n* **City Tuk-Tuks**: Standard remorque rides within town typically range from **$1.50 to $3 USD** (6,000 to 12,000 KHR).`,
      suggestions: [
        'What are the dress code rules for temples?',
        'What is the official Angkor Pass price?',
        'Recommend a 3-day itinerary in Siem Reap'
      ]
    };
  }

  return {
    reply: `**Choum Reap Sour!** Welcome to AngkorGenie, your dedicated Cambodian travel intelligence companion.\n\nI can assist you with:\n- **Angkor Wat & ancient temple guides** (sunrise spots, crowd timing)\n- **Dress code, photography rules & Angkor Pass permits**\n- **Day-by-day tailored itineraries** across Siem Reap, Phnom Penh, & islands\n- **Hotels, boutique eco-resorts & culinary hotspots**\n- **Transit fares, airport transfers & PassApp tuk-tuk pricing**\n\nHow can I help you plan your journey in Cambodia today?`,
    suggestions: [
      'When is the best time for sunrise at Angkor Wat?',
      'How do I make the most of a 3-day itinerary in Angkor?',
      'What authentic Khmer dishes should I try?'
    ]
  };
}

export const aiChatService = {
  /**
   * Send a chat message to the Angkor Verse AI Assistant.
   * Priority:
   * 1. Direct call to dedicated aichatbot microservice (Port 8001 / VITE_AI_CHAT_URL)
   * 2. Fallback to Laravel Backend proxy (/api/travel/ai/chat on Port 8000)
   * 3. Fallback to built-in local Cambodia intelligence engine
   */
  async sendMessage({ 
    message, 
    sessionId = null, 
    history = [], 
    province = null, 
    category = null, 
    language = 'en' 
  }) {
    const cleanMsg = (message || '').trim();
    if (!cleanMsg) {
      throw new Error('Message content cannot be empty.');
    }

    // 1. Attempt direct connection to aichatbot service (FastAPI on Port 8001)
    try {
      const res = await aiBotClient.post('/api/chat', {
        message: cleanMsg,
        session_id: sessionId,
        language,
        history: history.length > 0 ? history : undefined,
      });

      if (res.data) {
        const d = res.data;
        const inner = d.data && typeof d.data === 'object' ? d.data : {};
        const replyText = inner.response || inner.reply || inner.message || inner.answer || inner.content ||
          d.response || d.reply || d.message || d.answer || (typeof d.data === 'string' ? d.data : '');

        if (replyText) {
          return {
            success: true,
            reply: replyText,
            message: replyText,
            response: replyText,
            sessionId: d.session_id || inner.session_id || sessionId,
            suggestions: inner.suggestions || d.suggestions || [],
            sources: inner.sources || d.sources || [],
            relatedPlaces: inner.related_places || d.related_places || [],
            weather: inner.weather || d.weather || null,
            currency: inner.currency || d.currency || null,
            data: inner,
          };
        }
      }
    } catch {
      // aichatbot service not directly reachable, try backend proxy next
    }

    // 2. Fallback to Laravel Backend API proxy (/api/travel/ai/chat on Port 8000)
    try {
      const res = await api.post('/ai/chat', {
        message: cleanMsg,
        session_id: sessionId,
        province,
        category,
        language,
      });

      if (res.data) {
        const payload = res.data;
        const nestedData = (typeof payload.data === 'object' && payload.data !== null) ? payload.data : {};
        const replyText = payload.response || payload.reply || payload.answer || payload.message || nestedData.response || nestedData.reply || nestedData.message || (typeof payload.data === 'string' ? payload.data : '');

        if (replyText) {
          return {
            success: true,
            reply: replyText,
            message: replyText,
            response: replyText,
            sessionId: payload.session_id || nestedData.session_id || sessionId,
            suggestions: nestedData.suggestions || payload.suggestions || [],
            sources: nestedData.sources || payload.sources || [],
            relatedPlaces: nestedData.related_places || payload.related_places || [],
            data: payload,
          };
        }
      }
    } catch {
      // Laravel proxy also unreachable, proceed to local intelligence engine
    }

    // 3. Fallback to built-in local Cambodian travel intelligence
    const fallback = getLocalFallbackReply(cleanMsg);
    return {
      success: true,
      reply: fallback.reply,
      message: fallback.reply,
      response: fallback.reply,
      sessionId: sessionId || 'sess_local',
      suggestions: fallback.suggestions,
      sources: [
        { title: 'Ministry of Tourism Cambodia (Official Data)', url: 'https://tourismcambodia.org' }
      ],
      relatedPlaces: [],
      data: null,
    };
  },

  // Conversation history from Laravel backend
  async getConversations() {
    try {
      return await api.get('/ai/conversations');
    } catch {
      return { success: true, data: [] };
    }
  },

  async getConversationMessages(sessionId) {
    try {
      return await api.get(`/ai/conversations/${sessionId}/messages`);
    } catch {
      return { success: true, data: [] };
    }
  },

  async deleteConversation(sessionId) {
    try {
      return await api.delete(`/ai/conversations/${sessionId}`);
    } catch {
      return { success: true };
    }
  },

  // Smart Recommendations (queries aichatbot with fallback to backend)
  async getRecommendations(params) {
    try {
      const res = await aiBotClient.post('/api/recommendations', params);
      if (res.data) return res.data;
    } catch {
      // fallback to backend
    }
    return await api.post('/ai/recommendations', params);
  },

  // Day-by-Day Itineraries (queries aichatbot with fallback to backend)
  async generateItinerary(params) {
    try {
      const res = await aiBotClient.post('/api/itineraries', params);
      if (res.data) return res.data;
    } catch {
      // fallback to backend
    }
    return await api.post('/ai/itineraries', params);
  },

  // Real-time Weather (queries aichatbot with fallback to backend)
  async getWeather(province = 'Siem Reap', days = 3) {
    try {
      const res = await aiBotClient.get('/api/weather', { params: { province, days } });
      if (res.data) return res.data;
    } catch {
      // fallback to backend
    }
    return await api.get('/ai/weather', { params: { province, days } });
  },

  // Currency Exchange Rate
  async getCurrencyRate() {
    try {
      const res = await aiBotClient.get('/api/currency');
      if (res.data) return res.data;
    } catch {
      // fallback to backend
    }
    return await api.get('/ai/currency');
  },

  async convertCurrency(amount, from = 'USD', to = 'KHR') {
    try {
      const res = await aiBotClient.post('/api/currency/convert', {
        amount,
        from_currency: from,
        to_currency: to,
      });
      if (res.data) return res.data;
    } catch {
      // fallback to backend
    }
    return await api.post('/ai/currency/convert', {
      amount,
      from_currency: from,
      to_currency: to,
    });
  },

  // Transport estimator
  async getTransportEstimate(origin, destination, travelers = 1) {
    try {
      const res = await aiBotClient.get('/api/transport', {
        params: { origin, destination, travelers },
      });
      if (res.data) return res.data;
    } catch {
      // fallback to backend
    }
    return await api.get('/ai/transport', {
      params: { origin, destination, travelers },
    });
  },

  // Dynamic context-aware suggested topics (from aichatbot, Laravel proxy, or local dynamic engine)
  async getSuggestions({
    message = '',
    answer = '',
    sessionId = null,
    history = [],
    language = 'en',
    refresh = false,
    currentSuggestions = []
  } = {}) {
    const cleanMsg = (message || '').trim();
    const cleanAns = (answer || '').trim();

    // 1. Try dedicated aichatbot microservice (Port 8001 / VITE_AI_CHAT_URL)
    try {
      const res = await aiBotClient.post('/api/chat/suggestions', {
        message: cleanMsg,
        answer: cleanAns,
        session_id: sessionId,
        history,
        language,
        refresh: Boolean(refresh),
        current_suggestions: currentSuggestions,
      });

      if (res.data?.success && Array.isArray(res.data?.suggestions) && res.data.suggestions.length > 0) {
        return {
          success: true,
          topic: res.data.topic || 'SUGGESTED TOPICS',
          suggestions: res.data.suggestions.map(formatSuggestedTopic).filter(Boolean),
        };
      }
    } catch {
      // microservice offline, try backend proxy next
    }

    // 2. Fallback to Laravel Backend API proxy (/api/travel/ai/chat/suggestions on Port 8000)
    try {
      const res = await api.post('/ai/chat/suggestions', {
        message: cleanMsg,
        answer: cleanAns,
        session_id: sessionId,
        language,
        refresh: Boolean(refresh),
        current_suggestions: currentSuggestions,
      });

      const payload = res.data?.data || res.data;
      if (payload && Array.isArray(payload.suggestions) && payload.suggestions.length > 0) {
        return {
          success: true,
          topic: payload.topic || 'SUGGESTED TOPICS',
          suggestions: payload.suggestions.map(formatSuggestedTopic).filter(Boolean),
        };
      }
    } catch {
      // Laravel proxy offline, fallback to local dynamic engine
    }

    // 3. Built-in local dynamic Cambodian tourism suggestion engine
    return getLocalDynamicSuggestions({
      message: cleanMsg,
      answer: cleanAns,
      refresh,
      currentSuggestions,
    });
  },

  // Health check for AngkorGenie / aichatbot
  async getStatus() {
    try {
      const res = await aiBotClient.get('/api/health');
      if (res.data) return { success: true, service: 'aichatbot', ...res.data };
    } catch {
      // fallback
    }
    return await api.get('/ai/status');
  },
};

export default aiChatService;
