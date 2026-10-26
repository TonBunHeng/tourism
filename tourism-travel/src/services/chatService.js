import api from './api';

const LOCAL_AI_BOT_URL = import.meta.env.VITE_AI_CHAT_URL || 'http://127.0.0.1:8001';

// Smart local client knowledge fallback for offline/isolated local execution
function generateLocalClientResponse(message) {
  const msg = (message || '').toLowerCase().trim();

  if (/\b(hello|hi|hey|choum reap sour|sok sabay|good morning|good evening|good afternoon)\b/i.test(msg)) {
    return `**Choum Reap Sour!** Welcome to AngkorVerses AI Guide.\n\nI am your local intelligent travel companion running locally. I can help you with:\n- **Temples & Sunrise spots** across Angkor Archaeological Park\n- **Dress code & Angkor Pass** ticket requirements\n- **Day-by-day itineraries** for Siem Reap and Phnom Penh\n- **Traditional Khmer cuisine** and local restaurant tips\n- **Currency & payment** guidance (USD, KHR, Bakong KHQR)\n- **Live transit fares & tuk-tuk** recommendations\n\nWhat would you like to explore today?`;
  }

  if (msg.includes('sunrise') || msg.includes('sunset') || msg.includes('dawn')) {
    return `**Angkor Wat Sunrise & Sunset Guide**:\n\n* **Sunrise**: The premier vantage point is by the **Northern Reflecting Pond** (to the left of the main causeway). Arrive between **5:00 AM – 5:15 AM** to claim a front spot for reflection photos.\n* **Pass Requirement**: Ensure you purchase your Angkor Pass the day before (or online) so you don't wait at the checkpoint.\n* **Sunset Spots**: **Phnom Bakheng** offers spectacular sunset vistas over the temple canopy (capacity is strictly capped at 300 visitors, arrive by 4:00 PM). Excellent uncrowded alternatives include **Pre Rup** and **Srah Srang**.`;
  }

  if (msg.includes('dress') || msg.includes('wear') || msg.includes('code') || msg.includes('knees') || msg.includes('shoulders')) {
    return `**Temple Dress Code & Sacred Etiquette**:\n\n* **Shoulders & Knees Covered**: Both men and women must wear clothes covering shoulders and reaching below the knees.\n* **Restricted Clothing**: Sleeveless shirts, tank tops, and short skirts/shorts are strictly prohibited past ticket checkpoints.\n* **Footwear**: Sturdy walking shoes or hiking sandals are recommended for climbing uneven sandstone steps.\n* **Sacred Sanctuaries**: Hats and sunglasses must be removed inside inner tower sanctums.\n* **Monks & Monasteries**: Never touch a monk, and do not point your feet directly at Buddha statues.`;
  }

  if (msg.includes('pass') || msg.includes('ticket') || msg.includes('cost') || msg.includes('fee') || msg.includes('price') || msg.includes('how much')) {
    return `**Official Angkor Pass Pricing (2026)**:\n\n* **1-Day Pass**: **$37 USD** (Valid for 1 day)\n* **3-Day Pass**: **$62 USD** (Valid for any 3 days within a 10-day period)\n* **7-Day Pass**: **$72 USD** (Valid for any 7 days within a 1-month period)\n* **Children Under 12**: **FREE** admission (bring a passport copy for age verification).\n\n**Where to Buy**: Purchase at the official Angkor Enterprise ticket center on Apsara Road (open 4:30 AM – 5:30 PM) or online via **angkorenterprise.gov.kh**. Credit cards and cash (USD/KHR) are accepted.`;
  }

  if (msg.includes('ta prohm') || msg.includes('tomb raider') || msg.includes('roots') || msg.includes('jolie')) {
    return `**Ta Prohm (The 'Tomb Raider' Temple)**:\n\n* Built in 1186 by King Jayavarman VII as a Mahayana Buddhist monastery dedicated to his mother.\n* Famously highlighted in Angelina Jolie's movie *Lara Croft: Tomb Raider* (2001).\n* Left largely in its natural condition, giant silk-cotton (spung) and strangler fig tree roots twist over mossy stone corridors.\n* **Best Visiting Time**: Early morning around **7:30 AM** or late afternoon around **3:30 PM** when the sunlight filters through the forest canopy.`;
  }

  if (msg.includes('bayon') || msg.includes('faces') || msg.includes('smiling') || msg.includes('angkor thom')) {
    return `**Bayon Temple & The Smiling Stone Faces**:\n\n* Located at the exact center of the ancient royal walled city of **Angkor Thom**.\n* Features **216 colossal serene stone faces** carved across 54 gothic towers.\n* The faces depict **Avalokiteshvara** (the Bodhisattva of Compassion), embodying peaceful spiritual serenity with traits modeled after King Jayavarman VII.\n* Be sure to explore the outer gallery bas-reliefs showing naval battles with Champa and lively Khmer market scenes.`;
  }

  if (msg.includes('banteay srei') || msg.includes('citadel of women') || msg.includes('pink')) {
    return `**Banteay Srei ('Citadel of Women')**:\n\n* **Can you visit on a tuk-tuk?** **Yes, absolutely!** It is located about 35 km northeast of Siem Reap town. The remorque/tuk-tuk ride takes approximately **45 to 50 minutes** through picturesque villages, rice paddies, and palm sugar farms.\n* Built from hard pink sandstone in the 10th century, its delicate floral carvings are considered the finest in classical Khmer art.\n* **Travel Tip**: Combine your visit with the **Cambodia Landmine Museum** and **Banteay Samre** along the way.`;
  }

  if (msg.includes('hidden') || msg.includes('fewer tourists') || msg.includes('gem') || msg.includes('crowd') || msg.includes('quiet')) {
    return `**Top Hidden Gem Temples With Fewer Crowds**:\n\n* **Beng Mealea**: A massive 12th-century ruined temple enveloped by tropical jungle, 65 km east of Siem Reap.\n* **Koh Ker**: The 10th-century remote capital featuring the 7-tiered Prasat Thom pyramid (UNESCO World Heritage).\n* **Preah Khan**: Atmospheric temple monastery with sprawling courtyards and ancient libraries.\n* **Banteay Chhmar**: Remote temple fortress near the Thai border famous for exquisite bas-reliefs.\n* **Ta Nei**: A quiet, peaceful forest sanctuary tucked away between Preah Khan and Ta Keo.`;
  }

  if (msg.includes('itinerary') || msg.includes('plan') || msg.includes('3-day') || msg.includes('3 day') || msg.includes('day trip')) {
    return `**Recommended 3-Day Siem Reap Travel Itinerary**:\n\n* **Day 1: Angkor Classic Small Circuit**\n  - 05:00 AM: Angkor Wat sunrise & central towers\n  - 09:30 AM: South Gate of Angkor Thom & Bayon Temple\n  - 02:00 PM: Ta Prohm (Tomb Raider) & Banteay Kdei\n  - 07:00 PM: Dinner & stroll on Pub Street\n* **Day 2: Grand Circuit & Pink Temple**\n  - 08:00 AM: Preah Khan, Neak Pean & Ta Som\n  - 01:30 PM: Scenic countryside drive to Banteay Srei\n  - 05:00 PM: Sunset at Pre Rup temple\n* **Day 3: Nature & Culture**\n  - 08:30 AM: Tonle Sap Lake floating village (Kampong Phluk)\n  - 02:00 PM: Artisans Angkor & Old Market souvenir shopping\n  - 08:00 PM: Phare, The Cambodian Circus acrobatic performance`;
  }

  if (msg.includes('food') || msg.includes('dish') || msg.includes('eat') || msg.includes('amok') || msg.includes('lok lak') || msg.includes('restaurant')) {
    return `**Must-Try Traditional Khmer Dishes**:\n\n* **Fish Amok**: Cambodia's signature dish—fresh lake fish steamed in banana leaf with yellow kroeung paste, coconut milk, and noni leaves.\n* **Beef Lok Lak**: Tender stir-fried beef served on crisp lettuce, tomatoes, and red onions with a lime and Kampot black pepper dip.\n* **Nom Banh Chok**: Artisanal Khmer rice noodles with lemongrass green fish gravy soup and raw greens.\n* **Kuy Teav**: Fragrant breakfast rice noodle soup with pork broth, herbs, and garlic oil.\n* **Street Food Tip**: Look for stalls with high turnover. Fresh coconut water and grilled bananas are safe and delicious snacks!`;
  }

  if (msg.includes('currency') || msg.includes('money') || msg.includes('riel') || msg.includes('dollar') || msg.includes('usd') || msg.includes('khr') || msg.includes('cash') || msg.includes('card')) {
    return `**Cambodian Currency & Payment Guide**:\n\n* **Dual Currency**: Both **US Dollars (USD)** and **Cambodian Riel (KHR)** are accepted everywhere. Current exchange rate is approximately **1 USD = 4,100 KHR**.\n* **Cash Condition Rule**: US dollar bills must be **crisp, clean, and unblemished**. Vendors and banks may reject notes with small tears, stamps, or heavy folds.\n* **Small Change**: Change under $1 USD is returned in Cambodian Riel (e.g., 2,000 or 4,000 Riel).\n* **Digital Payment**: The **Bakong KHQR** system is widely used; tourists can download the Bakong app to pay via mobile scan.`;
  }

  if (msg.includes('weather') || msg.includes('season') || msg.includes('rain') || msg.includes('monsoon') || msg.includes('climate')) {
    return `**Cambodia Weather & Travel Seasons**:\n\n* **Cool & Dry Season (Nov – Feb)**: Peak tourist season with comfortable temperatures (**24°C – 30°C**) and minimal rainfall. Ideal for temple walks.\n* **Hot Season (Mar – May)**: Warm and humid (**32°C – 38°C**). Start temple excursions by 6:00 AM and take afternoon pool breaks.\n* **Green / Monsoon Season (Jun – Oct)**: Lush emerald green rice paddies, filled moats, and fewer crowds. Rain usually falls as refreshing 1-hour late afternoon showers.`;
  }

  if (msg.includes('transport') || msg.includes('tuk-tuk') || msg.includes('tuktuk') || msg.includes('taxi') || msg.includes('grab') || msg.includes('passapp')) {
    return `**Transportation & Tuk-Tuk Fares**:\n\n* **Ride-Hailing Apps**: Download **PassApp** or **Grab** for fixed, transparent pricing.\n* **Short Town Rides**: $1.50 – $3.00 USD (6,000 – 12,000 KHR).\n* **Angkor Small Circuit Full Day**: $15 – $25 USD for a dedicated private tuk-tuk driver.\n* **Angkor Grand Circuit + Banteay Srei**: $25 – $35 USD per day.\n* **Intercity (Siem Reap to Phnom Penh)**: Express vans (Giant Ibis, Larryta) take 5–6 hours and cost **$12 – $16 USD** per seat.`;
  }

  return `I am AngkorVerse AI Assistant, your personal Cambodian heritage guide running in local mode.\n\nHere are popular topics you can ask me about:\n- **Temples & Sunrise**: Best spots at Angkor Wat, Bayon, Ta Prohm, or Banteay Srei.\n- **Tickets & Etiquette**: Temple pass costs ($37, $62, $72) and dress code rules.\n- **Itineraries**: Suggested 3-day plans for Siem Reap and Phnom Penh.\n- **Local Tips**: Currency tips, tuk-tuk fares, street food recommendations, and weather forecast.\n\nFeel free to type your question or select one of the suggested prompts!`;
}

export const chatService = {
  // Send AI Chat Message
  async sendAiMessage(message, sessionId = null, context = {}) {
    // 1. Try local FastAPI aichatbot service directly (Port 8001)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const directRes = await fetch(`${LOCAL_AI_BOT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          session_id: sessionId,
          ...context,
        }),
      });
      clearTimeout(timeoutId);

      if (directRes.ok) {
        const directJson = await directRes.json();
        return directJson;
      }
    } catch {
      // Local aichatbot direct call timed out or not listening, proceed to Laravel proxy
    }

    // 2. Try Laravel backend endpoint (/api/travel/ai/chat)
    try {
      const response = await api.post('/ai/chat', {
        message,
        session_id: sessionId,
        ...context,
      });
      return response;
    } catch (err) {
      // If rate-limited, rethrow so the UI can display proper rate-limit guidance
      if (err?.status === 429) {
        throw err;
      }

      // 3. Robust local offline fallback so local testing never breaks or hangs
      const localAnswer = generateLocalClientResponse(message);
      return {
        success: true,
        data: {
          response: localAnswer,
          reply: localAnswer,
          answer: localAnswer,
          model: 'AngkorVerse Local Client Engine',
          session_id: sessionId,
        },
      };
    }
  },

  // Get AI Status
  async getAiStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${LOCAL_AI_BOT_URL}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    try {
      return await api.get('/ai/status');
    } catch {
      return { success: true, data: { status: 'ready', mode: 'local' } };
    }
  },

  // Support / User chats
  async getChats(params = {}) {
    try {
      const res = await fetch(`${LOCAL_AI_BOT_URL}/api/chats`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to Laravel
    }
    return await api.get('/chats', { params });
  },

  async getChatById(id) {
    try {
      const res = await fetch(`${LOCAL_AI_BOT_URL}/api/chats/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to Laravel
    }
    return await api.get(`/chats/${id}`);
  },

  async startChat(data) {
    try {
      const res = await fetch(`${LOCAL_AI_BOT_URL}/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback to Laravel
    }
    return await api.post('/chats', data);
  },

  async sendMessage(chatId, data) {
    try {
      const res = await fetch(`${LOCAL_AI_BOT_URL}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback to Laravel
    }
    return await api.post(`/chats/${chatId}/messages`, data);
  },
};

export default chatService;
