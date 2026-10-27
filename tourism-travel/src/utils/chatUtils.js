import { 
  Landmark, 
  Coins,
  MapPin,
  Compass,
  Hotel, 
  Utensils, 
  Car, 
  Calendar, 
  Sparkles, 
  ShieldAlert, 
  DollarSign,
  Sun
} from 'lucide-react';

// Exact sets of 4 suggested topics from angkorvers.vercel.app
export const SUGGESTED_TOPIC_SETS = [
  // Set 0: Initial home view on angkorvers.vercel.app
  [
    {
      icon: Sun,
      text: 'Best time to visit Cambodia & seasons',
      query: 'What is the best time of year to visit Cambodia in terms of weather, seasons, and festivals?',
    },
    {
      icon: Calendar,
      text: 'Plan a 3-day trip to Siem Reap',
      query: 'Plan a 3-day trip to Siem Reap covering Angkor Wat, local culture, and food.',
    },
    {
      icon: Compass,
      text: 'Battambang Bamboo Train & bat caves',
      query: 'Tell me about the Battambang Bamboo Train and the evening bat caves experience.',
    },
    {
      icon: Landmark,
      text: 'Explore Angkor Wat & sunrise spots',
      query: 'What are the best sunrise spots at Angkor Wat and how can I avoid crowds?',
    },
  ],
  // Set 1: Conversation suggested topics from angkorvers.vercel.app
  [
    {
      icon: Landmark,
      text: 'Phnom Penh Royal Palace & Silver Pagoda',
      query: 'What should I know before visiting Phnom Penh Royal Palace and Silver Pagoda?',
    },
    {
      icon: MapPin,
      text: '25 Provinces of Cambodia overview',
      query: 'Give me an overview of the 25 provinces of Cambodia and their tourism highlights.',
    },
    {
      icon: Calendar,
      text: '3-Day Siem Reap cultural itinerary',
      query: 'Create a detailed 3-Day Siem Reap cultural itinerary.',
    },
    {
      icon: MapPin,
      text: 'Bokor National Park in Kampot',
      query: 'What are the must-see attractions in Bokor National Park in Kampot?',
    },
  ],
  // Set 2: Highlights & Budget
  [
    {
      icon: Landmark,
      text: 'Discover Phnom Penh highlights',
      query: 'Discover Phnom Penh highlights including history, markets, and riverside dining.',
    },
    {
      icon: Coins,
      text: 'Cambodia travel budget & currency tips',
      query: 'Cambodia travel budget and currency tips (USD vs KHR and local pricing).',
    },
    {
      icon: MapPin,
      text: 'Mondulkiri waterfalls & eco-tourism',
      query: 'Tell me about Mondulkiri waterfalls and elephant eco-tourism sanctuaries.',
    },
    {
      icon: Utensils,
      text: 'What authentic Khmer dishes should I try?',
      query: 'What authentic Khmer dishes and street food should I try in Cambodia?',
    },
  ],
];

export const TRIP_GENIE_SUGGESTIONS = [
  {
    category: 'Temples & Culture',
    color: 'text-blue-500',
    badgeBg: 'bg-blue-50',
    icon: Landmark,
    question: 'How can I visit Angkor Wat and avoid the crowds?',
  },
  {
    category: 'Hotels & Accommodation',
    color: 'text-sky-500',
    badgeBg: 'bg-sky-50',
    icon: Hotel,
    question: 'Recommend comfortable hotels in Siem Reap.',
  },
  {
    category: 'Food & Cuisine',
    color: 'text-amber-500',
    badgeBg: 'bg-amber-50',
    icon: Utensils,
    question: 'What authentic Khmer dishes should I try?',
  },
  {
    category: 'Transportation',
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50',
    icon: Car,
    question: 'How do I travel between Phnom Penh and Siem Reap?',
  },
  {
    category: 'Itinerary Planning',
    color: 'text-indigo-500',
    badgeBg: 'bg-indigo-50',
    icon: Calendar,
    question: 'Create a 3-day Cambodia travel itinerary.',
  },
  {
    category: 'Local Experiences',
    color: 'text-purple-500',
    badgeBg: 'bg-purple-50',
    icon: Sparkles,
    question: 'What are the best local experiences in Cambodia?',
  },
  {
    category: 'Travel Tips',
    color: 'text-rose-500',
    badgeBg: 'bg-rose-50',
    icon: ShieldAlert,
    question: 'What should I know before visiting Cambodia?',
  },
  {
    category: 'Budget Planning',
    color: 'text-teal-500',
    badgeBg: 'bg-teal-50',
    icon: DollarSign,
    question: 'How much should I budget for a week in Cambodia?',
  },
];

export function generateSessionId(prefix = 'genie') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createChatMessage({ role, content, isError = false, suggestions = [], sources = [] }) {
  return {
    id: `${role}_${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    isError,
    suggestions,
    sources,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Dynamically assign an appropriate Lucide icon component based on topic keywords.
 */
export function getTopicIcon(text = '') {
  const t = (text || '').toLowerCase();

  if (
    t.includes('temple') ||
    t.includes('angkor') ||
    t.includes('wat') ||
    t.includes('bayon') ||
    t.includes('palace') ||
    t.includes('pagoda') ||
    t.includes('ruin') ||
    t.includes('heritage') ||
    t.includes('banteay') ||
    t.includes('ប្រាសាទ') ||
    t.includes('អង្គរ') ||
    t.includes('វាំង')
  ) {
    return Landmark;
  }

  if (
    t.includes('hotel') ||
    t.includes('resort') ||
    t.includes('stay') ||
    t.includes('accommodation') ||
    t.includes('hostel') ||
    t.includes('villa') ||
    t.includes('lodge') ||
    t.includes('សណ្ឋាគារ') ||
    t.includes('ផ្ទះសំណាក់')
  ) {
    return Hotel;
  }

  if (
    t.includes('food') ||
    t.includes('dish') ||
    t.includes('cuisine') ||
    t.includes('eat') ||
    t.includes('amok') ||
    t.includes('lok lak') ||
    t.includes('noodle') ||
    t.includes('restaurant') ||
    t.includes('dining') ||
    t.includes('breakfast') ||
    t.includes('ម្ហូប') ||
    t.includes('ញ៉ាំ') ||
    t.includes('អាហារ')
  ) {
    return Utensils;
  }

  if (
    t.includes('train') ||
    t.includes('car') ||
    t.includes('tuk') ||
    t.includes('passapp') ||
    t.includes('grab') ||
    t.includes('bus') ||
    t.includes('flight') ||
    t.includes('airport') ||
    t.includes('transit') ||
    t.includes('transport') ||
    t.includes('ferry') ||
    t.includes('boat') ||
    t.includes('ធ្វើដំណើរ') ||
    t.includes('ឡាន') ||
    t.includes('កង់បី')
  ) {
    return Car;
  }

  if (
    t.includes('budget') ||
    t.includes('cost') ||
    t.includes('price') ||
    t.includes('fee') ||
    t.includes('pass') ||
    t.includes('ticket') ||
    t.includes('usd') ||
    t.includes('riel') ||
    t.includes('khr') ||
    t.includes('currency') ||
    t.includes('money') ||
    t.includes('bakong') ||
    t.includes('តម្លៃ') ||
    t.includes('ថ្លៃ') ||
    t.includes('លុយ')
  ) {
    return Coins;
  }

  if (
    t.includes('itinerary') ||
    t.includes('day') ||
    t.includes('days') ||
    t.includes('3-day') ||
    t.includes('plan') ||
    t.includes('schedule') ||
    t.includes('trip') ||
    t.includes('tour') ||
    t.includes('គម្រោង') ||
    t.includes('ដំណើរកម្សាន្ត')
  ) {
    return Calendar;
  }

  if (
    t.includes('weather') ||
    t.includes('sun') ||
    t.includes('sunrise') ||
    t.includes('sunset') ||
    t.includes('season') ||
    t.includes('climate') ||
    t.includes('time to visit') ||
    t.includes('best time') ||
    t.includes('ថ្ងៃរះ') ||
    t.includes('ថ្ងៃលិច') ||
    t.includes('អាកាសធាតុ') ||
    t.includes('រដូវ')
  ) {
    return Sun;
  }

  if (
    t.includes('beach') ||
    t.includes('island') ||
    t.includes('koh rong') ||
    t.includes('sanloem') ||
    t.includes('waterfall') ||
    t.includes('nature') ||
    t.includes('lake') ||
    t.includes('elephant') ||
    t.includes('dolphin') ||
    t.includes('bamboo') ||
    t.includes('park') ||
    t.includes('sea') ||
    t.includes('កោះ') ||
    t.includes('ឆ្នេរ') ||
    t.includes('ទឹកធ្លាក់') ||
    t.includes('ធម្មជាតិ')
  ) {
    return Compass;
  }

  return Sparkles;
}

/**
 * Standardize any suggestion string or object into a structured { text, query, icon } object.
 */
export function formatSuggestedTopic(item) {
  if (!item) return null;

  if (typeof item === 'object' && item.text && item.icon) {
    return {
      text: item.text,
      query: item.query || item.text,
      icon: item.icon,
    };
  }

  const rawText = typeof item === 'string' ? item : (item.text || item.query || item.question || '');
  const cleanText = (rawText || '').trim();
  if (!cleanText) return null;

  const rawQuery = (typeof item === 'object' && item.query) ? item.query : cleanText;
  const icon = (typeof item === 'object' && item.icon) ? item.icon : getTopicIcon(cleanText);

  return {
    text: cleanText,
    query: rawQuery,
    icon,
  };
}

/**
 * Comprehensive fallback multi-category pool for offline or immediate dynamic generation.
 */
export const DYNAMIC_TOPIC_POOLS = [
  {
    category: 'Temples & Heritage',
    icon: Landmark,
    items: [
      { text: 'Explore Angkor Wat & sunrise spots', query: 'What are the best sunrise spots at Angkor Wat and how can I avoid crowds?' },
      { text: 'Angkor Pass official pricing & validity', query: 'What is the ticket price for Angkor Pass and where can I buy it?' },
      { text: 'Ancient temple sacred dress code', query: 'What is the dress code and etiquette for visiting ancient Cambodian temples?' },
      { text: 'Bayon Temple 54 smiling stone faces', query: 'Tell me about the history and smiling stone faces of Bayon Temple.' },
    ],
  },
  {
    category: 'Siem Reap & Itineraries',
    icon: Calendar,
    items: [
      { text: 'Plan a 3-day trip to Siem Reap', query: 'Plan a 3-day trip to Siem Reap covering Angkor Wat, local culture, and food.' },
      { text: 'Tonle Sap floating village boat tour', query: 'Tell me about taking a boat tour of Tonle Sap floating village and Kampong Phluk.' },
      { text: 'Phare Circus & night markets', query: 'What should I experience at Phare Cambodian Circus and night markets in Siem Reap?' },
      { text: 'Sacred Kulen Mountain waterfalls', query: 'Tell me about Kulen Mountain waterfalls and the River of a Thousand Lingas.' },
    ],
  },
  {
    category: 'Phnom Penh & Mekong',
    icon: Compass,
    items: [
      { text: 'Phnom Penh Royal Palace & Silver Pagoda', query: 'What should I know before visiting Phnom Penh Royal Palace and Silver Pagoda?' },
      { text: 'Mekong River sunset boat cruise', query: 'How do I take a sunset cruise along the Mekong and Tonle Sap rivers in Phnom Penh?' },
      { text: 'National Museum ancient Khmer art', query: 'What can I see at the National Museum of Cambodia in Phnom Penh?' },
      { text: 'Riverside cafes & Sisowath Quay', query: 'Recommend the best cafes, rooftop bars, and sights along Sisowath Quay riverside.' },
    ],
  },
  {
    category: 'Islands & Coastal',
    icon: Compass,
    items: [
      { text: 'Koh Rong & Sanloem island ferries', query: 'How do I travel to Koh Rong and Koh Rong Sanloem islands from Sihanoukville?' },
      { text: 'Fresh Kep crab & Kampot green pepper', query: 'Tell me about Kep Crab Market and tasting fresh blue crab with Kampot green pepper.' },
      { text: 'Bokor National Park historic hill station', query: 'What are the must-see attractions in Bokor National Park in Kampot?' },
      { text: 'Organic Kampot pepper farm tours', query: 'How can I visit an organic Kampot pepper plantation and salt fields?' },
    ],
  },
  {
    category: 'Heritage & Eco-Tourism',
    icon: MapPin,
    items: [
      { text: 'Battambang Bamboo Train & bat caves', query: 'Tell me about the Battambang Bamboo Train and the evening bat caves experience.' },
      { text: 'Mondulkiri Bousra waterfalls & elephants', query: 'Tell me about Mondulkiri Bousra waterfall and ethical elephant eco-tourism sanctuaries.' },
      { text: 'Volcanic Lake Yeak Laom in Ratanakiri', query: 'What is special about swimming in Lake Yeak Laom in Ratanakiri?' },
      { text: 'Rare Irrawaddy river dolphins in Kratie', query: 'Where and how can I see the rare freshwater Irrawaddy dolphins in Kratie?' },
    ],
  },
  {
    category: 'Khmer Food & Cuisine',
    icon: Utensils,
    items: [
      { text: 'What authentic Khmer dishes should I try?', query: 'What authentic Khmer dishes and street food should I try in Cambodia?' },
      { text: 'Traditional Fish Amok & Beef Lok Lak', query: 'Where can I taste traditional Fish Amok and tender Beef Lok Lak?' },
      { text: 'Nom Banh Chok Khmer breakfast noodles', query: 'What is Nom Banh Chok and where is the best place to try it in Siem Reap?' },
      { text: 'Khmer cooking classes & market tours', query: 'Can you recommend an authentic Khmer cooking class with a local morning market tour?' },
    ],
  },
  {
    category: 'Budget & Practical Tips',
    icon: Coins,
    items: [
      { text: 'Cambodia travel budget & currency tips', query: 'Cambodia travel budget and currency tips (USD vs KHR and local pricing).' },
      { text: 'PassApp & tuk-tuk ride-hailing guide', query: 'How do PassApp and Grab work for booking tuk-tuks and taxis in Cambodia?' },
      { text: 'Best time to visit Cambodia & seasons', query: 'What is the best time of year to visit Cambodia in terms of weather, seasons, and festivals?' },
      { text: 'Bakong Tourist App for QR payments', query: 'How does the Bakong Tourist App work for digital payments in Cambodia?' },
    ],
  },
];

/**
 * Generate 4 local dynamic suggestions with rotation and exclusion.
 */
export function getLocalDynamicSuggestions({ message = '', answer = '', refresh = false, currentSuggestions = [] } = {}) {
  const combined = `${(message || '').toLowerCase()} ${(answer || '').toLowerCase()}`.trim();
  const excludeSet = new Set((currentSuggestions || []).map((s) => (typeof s === 'string' ? s : s?.text || '')));

  // Check if context specifically matches a category
  let matchedPool = null;
  if (combined.includes('temple') || combined.includes('angkor') || combined.includes('sunrise') || combined.includes('pass')) {
    matchedPool = DYNAMIC_TOPIC_POOLS[0];
  } else if (combined.includes('itinerary') || combined.includes('hotel') || combined.includes('stay') || combined.includes('tonle sap')) {
    matchedPool = DYNAMIC_TOPIC_POOLS[1];
  } else if (combined.includes('phnom penh') || combined.includes('palace') || combined.includes('museum') || combined.includes('mekong')) {
    matchedPool = DYNAMIC_TOPIC_POOLS[2];
  } else if (combined.includes('beach') || combined.includes('island') || combined.includes('koh rong') || combined.includes('kampot') || combined.includes('kep')) {
    matchedPool = DYNAMIC_TOPIC_POOLS[3];
  } else if (combined.includes('battambang') || combined.includes('waterfall') || combined.includes('elephant') || combined.includes('nature')) {
    matchedPool = DYNAMIC_TOPIC_POOLS[4];
  } else if (combined.includes('food') || combined.includes('dish') || combined.includes('amok') || combined.includes('eat') || combined.includes('cuisine')) {
    matchedPool = DYNAMIC_TOPIC_POOLS[5];
  } else if (combined.includes('budget') || combined.includes('currency') || combined.includes('cost') || combined.includes('transit') || combined.includes('tuk')) {
    matchedPool = DYNAMIC_TOPIC_POOLS[6];
  }

  let candidates = [];
  if (matchedPool) {
    const unexcluded = matchedPool.items.filter((item) => !excludeSet.has(item.text));
    candidates = unexcluded.length >= 4 ? unexcluded : matchedPool.items;
  }

  if (candidates.length < 4) {
    // Pick 1 item from 4 different categories for maximum diversity
    const shuffledPools = [...DYNAMIC_TOPIC_POOLS].sort(() => Math.random() - 0.5);
    const multi = [];
    for (const pool of shuffledPools) {
      const available = pool.items.filter((item) => !excludeSet.has(item.text) && !multi.some((m) => m.text === item.text));
      if (available.length > 0) {
        multi.push(available[Math.floor(Math.random() * available.length)]);
      }
      if (multi.length === 4) break;
    }

    if (multi.length < 4) {
      const all = DYNAMIC_TOPIC_POOLS.flatMap((p) => p.items);
      for (const item of all) {
        if (!multi.some((m) => m.text === item.text)) {
          multi.push(item);
        }
        if (multi.length === 4) break;
      }
    }
    candidates = multi;
  }

  if (refresh) {
    candidates = [...candidates].sort(() => Math.random() - 0.5);
  }

  const finalItems = candidates.slice(0, 4).map(formatSuggestedTopic);
  return {
    success: true,
    topic: 'SUGGESTED TOPICS',
    suggestions: finalItems,
  };
}

/**
 * 25 Provinces of Cambodia and major tourist regions.
 */
export const CAMBODIA_PROVINCES = [
  'Siem Reap',
  'Phnom Penh',
  'Sihanoukville',
  'Battambang',
  'Kampot',
  'Kep',
  'Koh Rong',
  'Mondulkiri',
  'Ratanakiri',
  'Kratie',
  'Koh Kong',
  'Preah Vihear',
  'Kampong Cham',
  'Kampong Thom',
  'Pursat',
  'Takeo',
  'Kandal',
  'Kampong Chhnang',
  'Kampong Speu',
  'Prey Veng',
  'Svay Rieng',
  'Stung Treng',
  'Oddar Meanchey',
  'Pailin',
  'Banteay Meanchey',
  'Tboung Khmum',
];

