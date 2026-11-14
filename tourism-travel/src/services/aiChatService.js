import axios from 'axios';
import api, { AI_CHAT_SERVICE_URL } from './api';
import { formatSuggestedTopic, TOPICS_EN, TOPICS_KM, DEFAULT_USER_PROFILE } from '../utils/chatUtils';
import authService, { normalizeRole } from './authService';

/**
 * Derives unique isolation scope key for the active user:
 * - Registered Tourist (e.g. user ID 3): 'user_3'
 * - Business Owner (e.g. user ID 7): 'business_owner_7'
 * - Guest (not logged in): 'guest'
 */
export function getChatStorageScope(customUser = null) {
  const activeUser = customUser || authService.getCurrentUser();
  if (activeUser?.id) {
    const role = normalizeRole(activeUser.role || 'user');
    return `${role}_${activeUser.id}`;
  }
  return 'guest';
}

// Primary live backend URL matching angkorvers.vercel.app
const LIVE_VERCEL_API = 'https://angkorvers.vercel.app/api';

// Direct axios client for the dedicated aichatbot microservice (Port 8001 / Vercel API)
export const aiBotClient = axios.create({
  baseURL: AI_CHAT_SERVICE_URL && !AI_CHAT_SERVICE_URL.includes('127.0.0.1:8001') && !AI_CHAT_SERVICE_URL.includes('localhost:8001')
    ? AI_CHAT_SERVICE_URL 
    : (AI_CHAT_SERVICE_URL || LIVE_VERCEL_API),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 25000,
});

/**
 * Clean UTF-8 text decoder helper for incoming streaming chunks
 */
function cleanUtf8(str) {
  if (!str) return '';
  if (/[\u00e0-\u00ef][\u0080-\u00bf]/.test(str)) {
    try {
      const bytes = new Uint8Array([...str].map((c) => c.charCodeAt(0) & 0xff));
      const decoded = new TextDecoder('utf-8').decode(bytes);
      if (decoded && !decoded.includes('\uFFFD')) {
        return decoded;
      }
    } catch {
      // ignore
    }
  }
  return str;
}

/**
 * Intelligent local fallback knowledge when both online service and local backend
 * are temporarily offline or unreachable.
 */
function getLocalFallbackReply(message, lang = 'en') {
  const msg = (message || '').toLowerCase();
  const isKm = lang === 'km' || /[\u1780-\u17FF]/.test(msg);

  if (msg.includes('sunrise') || msg.includes('sunset') || msg.includes('dawn') || msg.includes('ថ្ងៃរះ')) {
    if (isKm) {
      return {
        reply: `**ការទស្សនាថ្ងៃរះ និងថ្ងៃលិចនៅអង្គរវត្ត**:\n\n* **ថ្ងៃរះ**: ទីតាំងល្អបំផុតគឺនៅមាត់ស្រះខាងជើង (ខាងឆ្វេងផ្លូវដើរចូល)។ គួរទៅដល់ចន្លោះម៉ោង **៥:០០ ដល់ ៥:១៥ ព្រឹក** ដើម្បីផ្តិតយករូបភាពស្រមោលប្រាសាទឆ្លុះលើផ្ទៃទឹកដ៏ស្រស់ស្អាត។\n* **ប័ណ្ណទស្សនា**: គួរបញ្ជាទិញប័ណ្ណអង្គរជាមុនតាមប្រព័ន្ធអនឡាញ ឬនៅរសៀលថ្ងៃមុន ដើម្បីជៀសវាងការតម្រង់ជួរនៅពេលព្រឹកព្រលឹម។\n* **ថ្ងៃលិច**: **ភ្នំបាក់ខែង** ជាទីតាំងពេញនិយមបំផុត (កំណត់ត្រឹម ៣០០ នាក់ គួរទៅដល់មុនម៉ោង ៤:០០ រសៀល)។ ទីតាំងជម្រើសផ្សេងទៀតមាន **ប្រែរូប** និង **ស្រះស្រង់**។`,
        suggestions: [
          'តើតម្លៃប័ណ្ណទស្សនាអង្គរមានប៉ុន្មានខ្លះ?',
          'តើការស្លៀកពាក់ចូលប្រាសាទមានលក្ខខណ្ឌអ្វីខ្លះ?',
          'សូមណែនាំគម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប'
        ]
      };
    }
    return {
      reply: `**Angkor Wat Sunrise & Sunset Guide**:\n\n* **Sunrise**: The premier vantage point is by the **Northern Reflecting Pond** (left of the main causeway). Arrive between **5:00 AM – 5:15 AM** for the iconic reflection photo.\n* **Pass Requirement**: Buy your Angkor Pass online or the afternoon prior so you bypass ticket booths in the morning.\n* **Sunset**: **Phnom Bakheng** offers sunset views over the temple canopy (capped at 300 visitors; arrive by 4:00 PM). Excellent uncrowded alternatives are **Pre Rup** and **Srah Srang**.`,
      suggestions: [
        'What is the ticket price for Angkor Pass?',
        'What is the temple dress code?',
        'How do I hire a tuk-tuk for sunrise?'
      ]
    };
  }

  if (msg.includes('ticket') || msg.includes('pass') || msg.includes('fee') || msg.includes('price') || msg.includes('cost') || msg.includes('តម្លៃ') || msg.includes('ប័ណ្ណ')) {
    if (isKm) {
      return {
        reply: `**តម្លៃប័ណ្ណទស្សនារមណីយដ្ឋានអង្គរ (Angkor Pass)**:\n\n* **ប័ណ្ណ ១ ថ្ងៃ**: **$37 USD** (មានសុពលភាពនៅថ្ងៃចេញប័ណ្ណ)\n* **ប័ណ្ណ ៣ ថ្ងៃ**: **$62 USD** (អាចប្រើប្រាស់បាន ៣ ថ្ងៃក្នុងរយៈពេល ១០ ថ្ងៃ)\n* **ប័ណ្ណ ៧ ថ្ងៃ**: **$72 USD** (អាចប្រើប្រាស់បាន ៧ ថ្ងៃក្នុងរយៈពេល ១ ខែ)\n* **កុមារអាយុក្រោម ១២ ឆ្នាំ**: **ឥតគិតថ្លៃ** (សូមបង្ហាញលិខិតឆ្លងដែន)\n\n**កន្លែងលក់ប័ណ្ណ**: មជ្ឈមណ្ឌលលក់ប័ណ្ណអង្គរសហគ្រាស (Angkor Enterprise) ផ្លូវ ៦០ ម៉ែត្រ ឬទិញតាមអនឡាញ **angkorenterprise.gov.kh**។`,
        suggestions: [
          'តើការស្លៀកពាក់ចូលប្រាសាទមានលក្ខខណ្ឌអ្វីខ្លះ?',
          'សូមណែនាំគម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប',
          'តើម្ហូបខ្មែរប្រពៃណីណាខ្លះដែលគួរញ៉ាំ?'
        ]
      };
    }
    return {
      reply: `**Official Angkor Pass Pricing**:\n\n* **1-Day Pass**: **$37 USD** (Valid on date of issue)\n* **3-Day Pass**: **$62 USD** (Valid any 3 days within a 10-day window)\n* **7-Day Pass**: **$72 USD** (Valid any 7 days within a 1-month window)\n* **Children under 12**: **Free** admission (present passport copy).\n\n**Where to purchase**: Buy at the official Angkor Enterprise ticket center on Apsara Road (4:30 AM – 5:30 PM) or online via **angkorenterprise.gov.kh**.`,
      suggestions: [
        'Recommend a 3-day Siem Reap itinerary',
        'What traditional Khmer foods should I try?',
        'Are there boutique resorts near Angkor?'
      ]
    };
  }

  if (isKm) {
    return {
      reply: `**ជំរាបសួរ!** ខ្ញុំជា **AngkorVers AI Assistant** 🇰🇭 — ជំនួយការឆ្លាតវៃសម្រាប់ទេសចរណ៍ វប្បធម៌ បេតិកភណ្ឌប្រវត្តិសាស្ត្រ និងការធ្វើដំណើរទូទាំងប្រទេសកម្ពុជា។\n\nខ្ញុំអាចជួយលោកអ្នកអំពី៖\n- **មគ្គុទ្ទេសក៍ប្រាសាទអង្គរវត្ត និងបេតិកភណ្ឌប្រវត្តិសាស្ត្រ**\n- **ការរៀបចំគម្រោងធ្វើដំណើរ ៣ ថ្ងៃ ឬ ៧ ថ្ងៃ នៅកម្ពុជា**\n- **ព័ត៌មានអាកាសធាតុ ថវិកា និងអត្រាប្តូរប្រាក់ (USD ➔ KHR)**\n- **សណ្ឋាគារ រមណីយដ្ឋាន និងម្ហូបខ្មែរឆ្ងាញ់ៗ**\n\nតើខ្ញុំអាចជួយដោះស្រាយ ឬស្វែងយល់អ្វីជូនអ្នកនៅថ្ងៃនេះ?`,
      suggestions: [
        'ស្វែងយល់ពីប្រាសាទអង្គរវត្ត និងប្រវត្តិសាស្ត្រ',
        'គម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប',
        'ម្ហូបខ្មែរប្រពៃណី និងអាមុកត្រីមិនគួររំលង',
        'ការចាយលុយដុល្លារ និងប្រាក់រៀល'
      ]
    };
  }

  return {
    reply: `Hello! 👋 I am **AngkorVers AI Assistant** 🇰🇭. I am your dedicated Cambodian travel intelligence companion, specializing in cultural heritage, temple exploration, custom itineraries, and local insights across all 25 provinces.\n\nHow can I help you plan your journey in Cambodia today?`,
    suggestions: [
      'Tell me about the history and sunrise spots at Angkor Wat.',
      'Create a 3-day Siem Reap cultural itinerary with top temples, costs, and tips.',
      'What should I know about Cambodian currency, exchange rates, and tipping culture?',
      'Give an overview of the 25 administrative divisions of Cambodia with their top travel spots.'
    ]
  };
}

export const aiChatService = {
  /**
   * SSE Streaming message sender matching angkorvers.vercel.app
   */
  async streamMessage(
    payload,
    { onChunk, onSuggestions, onDone, onError, signal } = {}
  ) {
    const message = typeof payload === 'object' ? payload.message : payload;
    const sessionId = typeof payload === 'object' ? payload.session_id || payload.sessionId : null;
    const language = (typeof payload === 'object' ? payload.language : 'en') || 'en';
    const attachments = typeof payload === 'object' ? payload.attachments || [] : [];
    const history = typeof payload === 'object' ? payload.history || [] : [];

    // Base endpoints to attempt streaming
    const resolvedChatUrl = (AI_CHAT_SERVICE_URL || 'http://127.0.0.1:8001').replace(/\/+$/, '');
    const streamEndpoints = [
      `${resolvedChatUrl}/api/chat/stream`,
      'https://angkorvers.vercel.app/api/chat/stream',
      '/api/chat/stream',
    ];

    let streamSucceeded = false;

    for (const endpoint of streamEndpoints) {
      if (streamSucceeded) break;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            message,
            session_id: sessionId,
            language,
            attachments,
            history,
          }),
          signal,
        });

        if (!response.ok) {
          continue;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();

            if (dataStr === '[DONE]') {
              streamSucceeded = true;
              if (onDone) onDone();
              return;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token && onChunk) {
                onChunk(cleanUtf8(parsed.token));
              }
              if (parsed.suggestions && onSuggestions) {
                onSuggestions(parsed.suggestions, parsed.topic);
              }
            } catch {
              // Non-JSON chunk, send raw token
              if (dataStr && onChunk) {
                onChunk(cleanUtf8(dataStr));
              }
            }
          }
        }

        streamSucceeded = true;
        if (onDone) onDone();
        return;
      } catch {
        if (signal?.aborted) {
          if (onDone) onDone();
          return;
        }
        // Try next endpoint
      }
    }

    // If streaming endpoints were unavailable, fallback seamlessly to standard sendMessage
    try {
      const result = await this.sendMessage({
        message,
        sessionId,
        language,
        attachments,
        history,
      });

      const fullReply = result.reply || result.message || '';
      
      // Emit tokens smoothly
      if (onChunk && fullReply) {
        onChunk(fullReply);
      }
      if (onSuggestions && result.suggestions) {
        onSuggestions(result.suggestions, result.topic || 'SUGGESTED TOPICS');
      }
      if (onDone) onDone(result);
    } catch (err) {
      if (signal?.aborted) {
        if (onDone) onDone();
        return;
      }
      if (onError) onError(err);
      else throw err;
    }
  },

  /**
   * Send a chat message to the AngkorVers AI Assistant.
   */
  async sendMessage({ 
    message, 
    sessionId = null, 
    history = [], 
    province = null, 
    category = null,
    language = 'en',
    attachments = []
  }) {
    const trimmedMessage = (message || '').trim();
    if (!trimmedMessage && (!attachments || attachments.length === 0)) {
      throw new Error('Message content cannot be empty.');
    }

    const payload = {
      message: trimmedMessage,
      session_id: sessionId,
      language,
      attachments,
      province,
      category,
      history: history && history.length > 0 ? history : undefined,
    };

    // 1. Attempt Live AngkorVers Online AI Microservice (https://angkorvers.vercel.app/api/chat)
    try {
      const res = await aiBotClient.post('/chat', payload);
      if (res.data) {
        const root = res.data;
        const inner = root.data && typeof root.data === 'object' ? root.data : {};
        const replyText = 
          inner.answer || 
          inner.reply || 
          inner.message || 
          inner.response || 
          root.answer || 
          root.reply || 
          root.message || 
          root.response ||
          (typeof root.data === 'string' ? root.data : '');

        if (replyText) {
          return {
            success: true,
            reply: replyText,
            message: replyText,
            response: replyText,
            sessionId: root.session_id || inner.session_id || sessionId,
            suggestions: inner.suggestions || root.suggestions || [],
            topic: inner.topic || root.topic || 'Suggested Topics',
            sources: inner.sources || root.sources || [],
            weather: inner.weather || root.weather || null,
            currency: inner.currency || root.currency || null,
            itinerary: inner.itinerary || root.itinerary || null,
            recommendations: inner.recommendations || root.recommendations || null,
            data: inner,
          };
        }
      }
    } catch {
      // Fall through to next tier
    }

    // 2. Attempt Laravel Backend proxy (/api/travel/ai/chat)
    try {
      const res = await api.post('/ai/chat', payload);
      if (res.data) {
        const root = res.data;
        const inner = typeof root.data === 'object' && root.data !== null ? root.data : {};
        const replyText = 
          root.response || 
          root.reply || 
          root.answer || 
          root.message || 
          inner.response || 
          inner.reply || 
          inner.message ||
          (typeof root.data === 'string' ? root.data : '');

        if (replyText) {
          return {
            success: true,
            reply: replyText,
            message: replyText,
            response: replyText,
            sessionId: root.session_id || inner.session_id || sessionId,
            suggestions: inner.suggestions || root.suggestions || [],
            topic: inner.topic || root.topic || 'Suggested Topics',
            sources: inner.sources || root.sources || [],
            weather: inner.weather || root.weather || null,
            currency: inner.currency || root.currency || null,
            itinerary: inner.itinerary || root.itinerary || null,
            recommendations: inner.recommendations || root.recommendations || null,
            data: root,
          };
        }
      }
    } catch {
      // Fall through to local intelligence
    }

    // 3. Robust Local Cambodia Intelligence Engine
    const fallback = getLocalFallbackReply(trimmedMessage, language);
    return {
      success: true,
      reply: fallback.reply,
      message: fallback.reply,
      response: fallback.reply,
      sessionId: sessionId || 'sess_local',
      suggestions: fallback.suggestions,
      topic: language === 'km' ? 'ប្រធានបទណែនាំ' : 'Suggested Topics',
      sources: [
        {
          title: 'Ministry of Tourism Cambodia (Official Data)',
          name: 'Ministry of Tourism Cambodia',
          url: 'https://tourismcambodia.org',
          category: 'Official Government Portal',
          location: 'Phnom Penh & Siem Reap'
        }
      ],
      weather: null,
      currency: null,
      itinerary: null,
      recommendations: null,
      data: null,
    };
  },

  /**
   * Session Management: Loads chat sessions list scoped to the current user/business
   */
  async getChatSessions(customUser = null) {
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_sessions_${scope}`;
    let cachedSessions = [];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cachedSessions = parsed;
        }
      }
    } catch {
      // ignore
    }

    // If authenticated user, fetch DB conversations for this specific user
    const activeUser = customUser || authService.getCurrentUser();
    if (activeUser?.id && authService.getToken()) {
      try {
        const res = await api.get('/ai/conversations');
        const dbList = res.data?.data || res.data || [];
        if (Array.isArray(dbList) && dbList.length > 0) {
          const mapped = dbList.map((c) => ({
            session_id: c.session_id,
            title: c.title || 'New Chat',
            created_at: c.created_at,
            updated_at: c.last_message_at || c.updated_at || c.created_at,
            messages_count: c.messages_count || 1,
          }));

          // Merge: use mapped DB sessions, preserving any local newly added sessions
          const dbIds = new Set(mapped.map((s) => s.session_id));
          const localOnly = cachedSessions.filter((s) => !dbIds.has(s.session_id));
          const combined = [...localOnly, ...mapped].slice(0, 50);

          localStorage.setItem(storageKey, JSON.stringify(combined));
          return combined;
        }
      } catch {
        // network or backend failure: fallback to cached
      }
    }

    return cachedSessions;
  },

  /**
   * Save or update a session in the list scoped to the user
   */
  saveSessionMetadata({ sessionId, title, firstMessage = '' }, customUser = null) {
    if (!sessionId) return;
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_sessions_${scope}`;

    try {
      const stored = localStorage.getItem(storageKey);
      let sessions = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(sessions)) sessions = [];

      const cleanTitle = (title || firstMessage || 'New Chat').slice(0, 48);
      const existingIdx = sessions.findIndex((s) => s.session_id === sessionId);

      if (existingIdx >= 0) {
        sessions[existingIdx] = {
          ...sessions[existingIdx],
          title: cleanTitle,
          updated_at: new Date().toISOString(),
        };
      } else {
        sessions.unshift({
          session_id: sessionId,
          title: cleanTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages_count: 1,
        });
      }

      localStorage.setItem(storageKey, JSON.stringify(sessions.slice(0, 50)));
    } catch {
      // ignore
    }
  },

  /**
   * Rename a chat session (updates user storage and DB)
   */
  async renameChatSession(sessionId, newTitle, customUser = null) {
    if (!sessionId || !newTitle) return;
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_sessions_${scope}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        let sessions = JSON.parse(stored);
        if (Array.isArray(sessions)) {
          sessions = sessions.map((s) => 
            s.session_id === sessionId ? { ...s, title: newTitle.trim() } : s
          );
          localStorage.setItem(storageKey, JSON.stringify(sessions));
        }
      }
    } catch {
      // ignore
    }

    const activeUser = customUser || authService.getCurrentUser();
    if (activeUser?.id && authService.getToken()) {
      try {
        await api.patch(`/ai/conversations/${sessionId}`, { title: newTitle.trim() });
      } catch {
        // ignore
      }
    }
  },

  /**
   * Delete a chat session (updates user storage and DB)
   */
  async deleteChatSession(sessionId, customUser = null) {
    if (!sessionId) return;
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_sessions_${scope}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        let sessions = JSON.parse(stored);
        if (Array.isArray(sessions)) {
          sessions = sessions.filter((s) => s.session_id !== sessionId);
          localStorage.setItem(storageKey, JSON.stringify(sessions));
        }
      }
      localStorage.removeItem(`aichat_messages_${scope}_${sessionId}`);
    } catch {
      // ignore
    }

    const activeUser = customUser || authService.getCurrentUser();
    if (activeUser?.id && authService.getToken()) {
      try {
        await api.delete(`/ai/conversations/${sessionId}`);
      } catch {
        // ignore
      }
    }
  },

  /**
   * Load stored messages for a specific session scoped to user
   */
  getChatMessages(sessionId, customUser = null) {
    if (!sessionId) return [];
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_messages_${scope}_${sessionId}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  },

  /**
   * Fetch chat messages from DB if not available in localStorage
   */
  async fetchChatMessagesFromApi(sessionId, customUser = null) {
    if (!sessionId) return [];
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_messages_${scope}_${sessionId}`;

    const activeUser = customUser || authService.getCurrentUser();
    if (activeUser?.id && authService.getToken()) {
      try {
        const res = await api.get(`/ai/conversations/${sessionId}/messages`);
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((m) => ({
            id: `msg_${m.id || Date.now()}`,
            role: m.role || 'user',
            sender: m.role || 'user',
            content: m.content,
            message: m.content,
            timestamp: m.created_at || new Date().toISOString(),
            weather: m.metadata?.weather || null,
            itinerary: m.metadata?.itinerary || null,
            recommendations: m.metadata?.recommendations || null,
            currency: m.metadata?.currency || null,
            sources: m.metadata?.sources || [],
            suggestions: m.metadata?.suggestions || [],
          }));

          localStorage.setItem(storageKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch {
        // ignore
      }
    }
    return this.getChatMessages(sessionId, customUser);
  },

  /**
   * Persist messages for a specific session scoped to user
   */
  saveChatMessages(sessionId, messages = [], customUser = null) {
    if (!sessionId || !Array.isArray(messages)) return;
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_messages_${scope}_${sessionId}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
      localStorage.setItem(`aichat_last_active_${scope}`, sessionId);
    } catch {
      // ignore
    }
  },

  /**
   * Get last active session ID for user
   */
  getLastActiveSessionId(customUser = null) {
    const scope = getChatStorageScope(customUser);
    return localStorage.getItem(`aichat_last_active_${scope}`) || null;
  },

  /**
   * Get user AI profile & personalization scoped to user
   */
  getUserProfile(customUser = null) {
    const activeUser = customUser || authService.getCurrentUser();
    const scope = getChatStorageScope(activeUser);
    const storageKey = `aichat_profile_${scope}`;

    let saved = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch {
      // ignore
    }

    if (!activeUser) {
      return saved || DEFAULT_USER_PROFILE;
    }

    const isBiz = normalizeRole(activeUser.role) === 'business_owner';
    const biz = activeUser.business || {};

    return {
      name: activeUser.name || saved?.name || 'Traveler',
      email: activeUser.email || saved?.email || '',
      role: activeUser.role || 'user',
      avatar: activeUser.avatar || null,
      isBusinessOwner: isBiz,
      businessName: biz.name || saved?.businessName || (isBiz ? `${activeUser.name}'s Business` : ''),
      businessCategory: biz.category || saved?.businessCategory || '',
      businessProvince: biz.province || saved?.businessProvince || '',
      travelStyle: saved?.travelStyle || (isBiz ? 'business' : 'cultural'),
      preferredDestinations: saved?.preferredDestinations || ['siem_reap'],
      businessBio: biz.description || saved?.businessBio || '',
    };
  },

  /**
   * Save user AI profile & personalization scoped to user
   */
  saveUserProfile(profile, customUser = null) {
    if (!profile) return;
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_profile_${scope}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch {
      // ignore
    }
  },

  /**
   * Clear all AI chat history for the current user/scope only
   */
  async clearAllUserChatHistory(customUser = null) {
    const scope = getChatStorageScope(customUser);
    const storageKey = `aichat_sessions_${scope}`;

    try {
      const stored = localStorage.getItem(storageKey);
      const sessions = stored ? JSON.parse(stored) : [];
      if (Array.isArray(sessions)) {
        for (const s of sessions) {
          if (s.session_id) {
            localStorage.removeItem(`aichat_messages_${scope}_${s.session_id}`);
          }
        }
      }
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`aichat_last_active_${scope}`);
    } catch {
      // ignore
    }

    const activeUser = customUser || authService.getCurrentUser();
    if (activeUser?.id && authService.getToken()) {
      try {
        const res = await api.get('/ai/conversations');
        const dbList = res.data?.data || res.data || [];
        for (const c of dbList) {
          if (c.session_id) {
            await api.delete(`/ai/conversations/${c.session_id}`).catch(() => {});
          }
        }
      } catch {
        // ignore
      }
    }
  },

  /**
   * Fetch recommendations
   */
  async getRecommendations(params = {}) {
    try {
      const res = await aiBotClient.post('/recommendations', params);
      if (res.data?.data) return res.data.data;
      if (res.data) return res.data;
    } catch {
      // ignore
    }
    try {
      const res = await api.post('/ai/recommendations', params);
      return res.data?.data || res.data;
    } catch {
      // ignore
    }
    return [];
  },

  /**
   * Generate Itinerary
   */
  async generateItinerary(params = {}) {
    try {
      const res = await aiBotClient.post('/itineraries', params);
      if (res.data?.data) return res.data.data;
      if (res.data) return res.data;
    } catch {
      // ignore
    }
    try {
      const res = await api.post('/ai/itineraries', params);
      return res.data?.data || res.data;
    } catch {
      // ignore
    }
    return null;
  },

  /**
   * Fetch Weather
   */
  async getWeather(province = 'Siem Reap', days = 3) {
    try {
      const res = await aiBotClient.get('/weather', { params: { province, days } });
      if (res.data?.data) return res.data.data;
      if (res.data) return res.data;
    } catch {
      // ignore
    }
    try {
      const res = await api.get('/ai/weather', { params: { province, days } });
      return res.data?.data || res.data;
    } catch {
      // ignore
    }
    return null;
  },

  /**
   * Fetch Currency
   */
  async getCurrencyRate() {
    try {
      const res = await aiBotClient.get('/currency');
      if (res.data?.data) return res.data.data;
      if (res.data) return res.data;
    } catch {
      // ignore
    }
    try {
      const res = await api.get('/ai/currency');
      return res.data?.data || res.data;
    } catch {
      // ignore
    }
    return null;
  },

  /**
   * Convert Currency
   */
  async convertCurrency(amount, from = 'USD', to = 'KHR') {
    try {
      const res = await aiBotClient.post('/currency/convert', { amount, from_currency: from, to_currency: to });
      if (res.data) return res.data;
    } catch {
      // ignore
    }
    try {
      const res = await api.post('/ai/currency/convert', { amount, from_currency: from, to_currency: to });
      return res.data;
    } catch {
      // ignore
    }
    return { amount, from_currency: from, to_currency: to, result: from === 'USD' ? amount * 4100 : amount / 4100 };
  },

  /**
   * Fetch Suggestions
   */
  async getSuggestions({ 
    message = '', 
    answer = '', 
    sessionId = null, 
    language = 'en', 
    refresh = false, 
    currentSuggestions = [] 
  } = {}) {
    try {
      const res = await aiBotClient.post('/chat/suggestions', {
        message: (message || '').trim(),
        answer: (answer || '').trim(),
        session_id: sessionId,
        language,
        refresh: !!refresh,
        current_suggestions: currentSuggestions,
      });

      if (res.data?.success && Array.isArray(res.data?.suggestions) && res.data.suggestions.length > 0) {
        return {
          success: true,
          topic: res.data.topic || (language === 'km' ? 'ប្រធានបទណែនាំ' : 'Suggested Topics'),
          suggestions: res.data.suggestions.map((s) => formatSuggestedTopic(s, language)).filter(Boolean),
        };
      }
    } catch {
      // ignore
    }

    // Fallback to pool
    const pool = language === 'km' ? TOPICS_KM : TOPICS_EN;
    const shuffled = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map((item) => formatSuggestedTopic(item, language))
      .filter(Boolean);
    return {
      success: true,
      topic: language === 'km' ? 'ប្រធានបទណែនាំ' : 'Suggested Topics',
      suggestions: shuffled,
    };
  },

  /**
   * Health check for AngkorVers / aichatbot
   */
  async getStatus() {
    try {
      const res = await aiBotClient.get('/health', { timeout: 4000 });
      if (res.data) return { success: true, service: 'online_ai', ...res.data };
    } catch {
      // ignore
    }
    try {
      const res = await api.get('/ai/status', { timeout: 4000 });
      return res.data;
    } catch {
      // ignore
    }
    return { success: false, status: 'offline' };
  },
};

export default aiChatService;
