import { 
  Landmark, 
  MapPin,
  Compass,
  Hotel, 
  Utensils, 
  Car, 
  Calendar, 
  DollarSign,
  Sun
} from 'lucide-react';

// Exact 12 Suggested Topics in English from angkorvers.vercel.app
export const TOPICS_EN = [
  {
    id: 'angkor_wat',
    icon: Landmark,
    title: 'Explore Angkor Wat & ancient temples',
    text: 'Explore Angkor Wat & ancient temples',
    prompt: 'Tell me about the history, architecture, and sunrise spots at Angkor Wat.',
    query: 'Tell me about the history, architecture, and sunrise spots at Angkor Wat.',
  },
  {
    id: 'itinerary',
    icon: Calendar,
    title: '3-Day Siem Reap cultural itinerary',
    text: '3-Day Siem Reap cultural itinerary',
    prompt: 'Create a 3-day Siem Reap cultural itinerary with top temples, costs, and tips.',
    query: 'Create a 3-day Siem Reap cultural itinerary with top temples, costs, and tips.',
  },
  {
    id: 'phnom_penh',
    icon: Landmark,
    title: 'Phnom Penh Royal Palace & riverfront',
    text: 'Phnom Penh Royal Palace & riverfront',
    prompt: 'What are the top attractions and riverside experiences to explore in Phnom Penh?',
    query: 'What are the top attractions and riverside experiences to explore in Phnom Penh?',
  },
  {
    id: 'islands',
    icon: Compass,
    title: 'Koh Rong & tropical white-sand beaches',
    text: 'Koh Rong & tropical white-sand beaches',
    prompt: 'Tell me about speed ferries, resorts, and beaches on Koh Rong and Koh Rong Sanloem.',
    query: 'Tell me about speed ferries, resorts, and beaches on Koh Rong and Koh Rong Sanloem.',
  },
  {
    id: 'crab',
    icon: Utensils,
    title: 'Fresh Kampot pepper crab in Kep',
    text: 'Fresh Kampot pepper crab in Kep',
    prompt: 'Tell me about fresh Kampot pepper crab in Kep and visiting Kep Crab Market.',
    query: 'Tell me about fresh Kampot pepper crab in Kep and visiting Kep Crab Market.',
  },
  {
    id: 'nature',
    icon: MapPin,
    title: 'Bokor National Park in Kampot',
    text: 'Bokor National Park in Kampot',
    prompt: 'What can I explore at Bokor National Park and the historic hill station in Kampot?',
    query: 'What can I explore at Bokor National Park and the historic hill station in Kampot?',
  },
  {
    id: 'battambang',
    icon: Compass,
    title: 'Battambang Bamboo Train & bat caves',
    text: 'Battambang Bamboo Train & bat caves',
    prompt: 'Tell me about the Bamboo Train, colonial architecture, and bat caves in Battambang.',
    query: 'Tell me about the Bamboo Train, colonial architecture, and bat caves in Battambang.',
  },
  {
    id: 'mondulkiri',
    icon: MapPin,
    title: 'Mondulkiri waterfalls & eco-tourism',
    text: 'Mondulkiri waterfalls & eco-tourism',
    prompt: 'What are the top eco-tourism spots, elephant sanctuaries, and waterfalls in Mondulkiri?',
    query: 'What are the top eco-tourism spots, elephant sanctuaries, and waterfalls in Mondulkiri?',
  },
  {
    id: 'food',
    icon: Utensils,
    title: 'Must-try authentic Khmer dishes & Amok',
    text: 'Must-try authentic Khmer dishes & Amok',
    prompt: 'What authentic Khmer dishes like Fish Amok, Lok Lak, and Nom Banh Chok are must-try?',
    query: 'What authentic Khmer dishes like Fish Amok, Lok Lak, and Nom Banh Chok are must-try?',
  },
  {
    id: 'currency',
    icon: DollarSign,
    title: 'Cambodia travel budget & USD vs Riel',
    text: 'Cambodia travel budget & USD vs Riel',
    prompt: 'What should I know about Cambodian currency, exchange rates, and tipping culture?',
    query: 'What should I know about Cambodian currency, exchange rates, and tipping culture?',
  },
  {
    id: 'provinces',
    icon: MapPin,
    title: '25 Provinces of Cambodia overview',
    text: '25 Provinces of Cambodia overview',
    prompt: 'Give an overview of the 25 administrative divisions of Cambodia with their top travel spots.',
    query: 'Give an overview of the 25 administrative divisions of Cambodia with their top travel spots.',
  },
  {
    id: 'sunrise',
    icon: Sun,
    title: 'Best time for Angkor Wat sunrise & weather',
    text: 'Best time for Angkor Wat sunrise & weather',
    prompt: 'What is the best time and spot for Angkor Wat sunrise and best travel seasons?',
    query: 'What is the best time and spot for Angkor Wat sunrise and best travel seasons?',
  },
];

// Exact 12 Suggested Topics in Khmer from angkorvers.vercel.app
export const TOPICS_KM = [
  {
    id: 'angkor_wat',
    icon: Landmark,
    title: 'ស្វែងយល់ពីប្រាសាទអង្គរវត្ត និងប្រវត្តិសាស្ត្រ',
    text: 'ស្វែងយល់ពីប្រាសាទអង្គរវត្ត និងប្រវត្តិសាស្ត្រ',
    prompt: 'សូមរៀបរាប់អំពីប្រវត្តិសាស្ត្រ ស្ថាបត្យកម្ម និងកន្លែងមើលថ្ងៃរះស្អាតបំផុតនៅអង្គរវត្ត។',
    query: 'សូមរៀបរាប់អំពីប្រវត្តិសាស្ត្រ ស្ថាបត្យកម្ម និងកន្លែងមើលថ្ងៃរះស្អាតបំផុតនៅអង្គរវត្ត។',
  },
  {
    id: 'itinerary',
    icon: Calendar,
    title: 'គម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប',
    text: 'គម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប',
    prompt: 'រៀបចំគម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប រួមទាំងការស្នាក់នៅ ម្ហូបអាហារ និងកញ្ចប់ថវិកា។',
    query: 'រៀបចំគម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប រួមទាំងការស្នាក់នៅ ម្ហូបអាហារ និងកញ្ចប់ថវិកា។',
  },
  {
    id: 'phnom_penh',
    icon: Landmark,
    title: 'ដើរលេងរាជធានីភ្នំពេញ និងព្រះបរមរាជវាំង',
    text: 'ដើរលេងរាជធានីភ្នំពេញ និងព្រះបរមរាជវាំង',
    prompt: 'តើនៅភ្នំពេញមានកន្លែងកម្សាន្ត និងសារមន្ទីរប្រវត្តិសាស្ត្រណាខ្លះដែលគួរទៅទស្សនា?',
    query: 'តើនៅភ្នំពេញមានកន្លែងកម្សាន្ត និងសារមន្ទីរប្រវត្តិសាស្ត្រណាខ្លះដែលគួរទៅទស្សនា?',
  },
  {
    id: 'islands',
    icon: Compass,
    title: 'កោះរ៉ុង និងឆ្នេរខ្សាច់សកម្សាន្ត',
    text: 'កោះរ៉ុង និងឆ្នេរខ្សាច់សកម្សាន្ត',
    prompt: 'ស្វែងយល់ពីដំណើរកម្សាន្តទៅកាន់កោះរ៉ុង និងកោះរ៉ុងសន្លឹម រួមទាំងអូប័រល្បឿនលឿន។',
    query: 'ស្វែងយល់ពីដំណើរកម្សាន្តទៅកាន់កោះរ៉ុង និងកោះរ៉ុងសន្លឹម រួមទាំងអូប័រល្បឿនលឿន។',
  },
  {
    id: 'crab',
    icon: Utensils,
    title: 'ក្តាមឆាម្រេចខ្ចីនៅកែប',
    text: 'ក្តាមឆាម្រេចខ្ចីនៅកែប',
    prompt: 'តើក្តាមឆាម្រេចខ្ចីនៅកែប និងចម្ការម្រេចកំពតមានអ្វីពិសេស?',
    query: 'តើក្តាមឆាម្រេចខ្ចីនៅកែប និងចម្ការម្រេចកំពតមានអ្វីពិសេស?',
  },
  {
    id: 'nature',
    icon: MapPin,
    title: 'ឧទ្យានជាតិភ្នំបូកគោ ខេត្តកំពត',
    text: 'ឧទ្យានជាតិភ្នំបូកគោ ខេត្តកំពត',
    prompt: 'តើការឡើងកម្សាន្តលើភ្នំបូកគោមានតំបន់ទេសចរណ៍ និងសំណង់ប្រវត្តិសាស្ត្រណាខ្លះ?',
    query: 'តើការឡើងកម្សាន្តលើភ្នំបូកគោមានតំបន់ទេសចរណ៍ និងសំណង់ប្រវត្តិសាស្ត្រណាខ្លះ?',
  },
  {
    id: 'battambang',
    icon: Compass,
    title: 'ជិះឡូរីបាត់ដំបង និងទស្សនាល្អាងប្រចៀវ',
    text: 'ជិះឡូរីបាត់ដំបង និងទស្សនាល្អាងប្រចៀវ',
    prompt: 'សូមណែនាំដំណើរកម្សាន្តជិះឡូរី (Bamboo Train) និងមើលហ្វូងប្រចៀវនៅភ្នំសំពៅ បាត់ដំបង។',
    query: 'សូមណែនាំដំណើរកម្សាន្តជិះឡូរី (Bamboo Train) និងមើលហ្វូងប្រចៀវនៅភ្នំសំពៅ បាត់ដំបង។',
  },
  {
    id: 'mondulkiri',
    icon: MapPin,
    title: 'ទឹកធ្លាក់ប៊ូស្រា និងទេសចរណ៍មណ្ឌលគិរី',
    text: 'ទឹកធ្លាក់ប៊ូស្រា និងទេសចរណ៍មណ្ឌលគិរី',
    prompt: 'តើដំណើរកម្សាន្តទៅមណ្ឌលគិរី ទឹកធ្លាក់ប៊ូស្រា និងជម្រកដំរីមានអ្វីគួរចាប់អារម្មណ៍?',
    query: 'តើដំណើរកម្សាន្តទៅមណ្ឌលគិរី ទឹកធ្លាក់ប៊ូស្រា និងជម្រកដំរីមានអ្វីគួរចាប់អារម្មណ៍?',
  },
  {
    id: 'food',
    icon: Utensils,
    title: 'ម្ហូបខ្មែរប្រពៃណី និងអាមុកត្រីមិនគួររំលង',
    text: 'ម្ហូបខ្មែរប្រពៃណី និងអាមុកត្រីមិនគួររំលង',
    prompt: 'តើម្ហូបខ្មែរប្រពៃណីណាខ្លះដែលមិនគួររំលង ដូចជាអាមុក ឡុកឡាក់ និងនំបញ្ចុក?',
    query: 'តើម្ហូបខ្មែរប្រពៃណីណាខ្លះដែលមិនគួររំលង ដូចជាអាមុក ឡុកឡាក់ និងនំបញ្ចុក?',
  },
  {
    id: 'currency',
    icon: DollarSign,
    title: 'ការចាយលុយដុល្លារ និងប្រាក់រៀល',
    text: 'ការចាយលុយដុល្លារ និងប្រាក់រៀល',
    prompt: 'តើការចាយលុយដុល្លារ និងប្រាក់រៀលនៅកម្ពុជាត្រូវដឹងអ្វីខ្លះ?',
    query: 'តើការចាយលុយដុល្លារ និងប្រាក់រៀលនៅកម្ពុជាត្រូវដឹងអ្វីខ្លះ?',
  },
  {
    id: 'provinces',
    icon: MapPin,
    title: 'រាជធានី-ខេត្តទាំង ២៥ នៃកម្ពុជា',
    text: 'រាជធានី-ខេត្តទាំង ២៥ នៃកម្ពុជា',
    prompt: 'សូមរៀបរាប់សង្ខេបអំពីរាជធានី-ខេត្តទាំង ២៥ នៅកម្ពុជា រួមទាំងសក្តានុពលទេសចរណ៍។',
    query: 'សូមរៀបរាប់សង្ខេបអំពីរាជធានី-ខេត្តទាំង ២៥ នៅកម្ពុជា រួមទាំងសក្តានុពលទេសចរណ៍។',
  },
  {
    id: 'sunrise',
    icon: Sun,
    title: 'ពេលវេលាល្អបំផុតមើលថ្ងៃរះអង្គរវត្ត',
    text: 'ពេលវេលាល្អបំផុតមើលថ្ងៃរះអង្គរវត្ត',
    prompt: 'តើពេលវេលា និងទីតាំងណាដែលល្អបំផុតសម្រាប់ទស្សនាថ្ងៃរះនៅអង្គរវត្ត?',
    query: 'តើពេលវេលា និងទីតាំងណាដែលល្អបំផុតសម្រាប់ទស្សនាថ្ងៃរះនៅអង្គរវត្ត?',
  },
];

/**
 * Returns a slice of 4 suggested topics for the given language and page/rotation index.
 */
export function getTopicsForLanguage(lang = 'en', setIndex = 0) {
  const pool = lang === 'km' ? TOPICS_KM : TOPICS_EN;
  const total = pool.length;
  const start = (setIndex * 4) % total;
  const result = [];
  for (let i = 0; i < 4; i++) {
    const item = pool[(start + i) % total];
    result.push({
      ...item,
      text: item.title,
      query: item.prompt,
    });
  }
  return result;
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
    t.includes('room') ||
    t.includes('សណ្ឋាគារ') ||
    t.includes('ផ្ទះសំណាក់')
  ) {
    return Hotel;
  }

  if (
    t.includes('food') ||
    t.includes('dish') ||
    t.includes('cuisine') ||
    t.includes('restaurant') ||
    t.includes('amok') ||
    t.includes('dining') ||
    t.includes('eat') ||
    t.includes('lunch') ||
    t.includes('dinner') ||
    t.includes('crab') ||
    t.includes('ម្ហូប') ||
    t.includes('អាហារ') ||
    t.includes('អាមុក')
  ) {
    return Utensils;
  }

  if (
    t.includes('transport') ||
    t.includes('transit') ||
    t.includes('flight') ||
    t.includes('bus') ||
    t.includes('car') ||
    t.includes('taxi') ||
    t.includes('passapp') ||
    t.includes('tuk') ||
    t.includes('ឡាន') ||
    t.includes('តាក់ស៊ី') ||
    t.includes('កង់បី')
  ) {
    return Car;
  }

  if (
    t.includes('itinerary') ||
    t.includes('day') ||
    t.includes('schedule') ||
    t.includes('plan') ||
    t.includes('calendar') ||
    t.includes('3-day') ||
    t.includes('គម្រោង') ||
    t.includes('ដំណើរកម្សាន្ត')
  ) {
    return Calendar;
  }

  if (
    t.includes('beach') ||
    t.includes('island') ||
    t.includes('sea') ||
    t.includes('ocean') ||
    t.includes('koh rong') ||
    t.includes('ferry') ||
    t.includes('speed ferry') ||
    t.includes('ឆ្នេរ') ||
    t.includes('កោះ')
  ) {
    return Compass;
  }

  if (
    t.includes('budget') ||
    t.includes('cost') ||
    t.includes('price') ||
    t.includes('currency') ||
    t.includes('dollar') ||
    t.includes('riel') ||
    t.includes('khr') ||
    t.includes('usd') ||
    t.includes('money') ||
    t.includes('លុយ') ||
    t.includes('ប្រាក់') ||
    t.includes('តម្លៃ') ||
    t.includes('ថវិកា')
  ) {
    return DollarSign;
  }

  if (
    t.includes('sun') ||
    t.includes('sunrise') ||
    t.includes('sunset') ||
    t.includes('weather') ||
    t.includes('season') ||
    t.includes('climate') ||
    t.includes('ថ្ងៃរះ') ||
    t.includes('ថ្ងៃលិច') ||
    t.includes('អាកាសធាតុ')
  ) {
    return Sun;
  }

  if (
    t.includes('nature') ||
    t.includes('park') ||
    t.includes('waterfall') ||
    t.includes('mountain') ||
    t.includes('forest') ||
    t.includes('ទឹកធ្លាក់') ||
    t.includes('ព្រៃ') ||
    t.includes('ភ្នំ') ||
    t.includes('ធម្មជាតិ')
  ) {
    return MapPin;
  }

  return Compass;
}

/**
 * Format any incoming suggestion string or object into a normalized { id, icon, title, text, prompt, query } object.
 */
export function formatSuggestedTopic(raw, lang = 'en') {
  if (!raw) return null;
  if (typeof raw === 'object' && (raw.title || raw.text)) {
    const title = raw.title || raw.text;
    const prompt = raw.prompt || raw.query || raw.title || raw.text;
    return {
      ...raw,
      id: raw.id || `topic_${Math.random().toString(36).slice(2, 8)}`,
      title,
      text: title,
      prompt,
      query: prompt,
      icon: raw.icon || getTopicIcon(title || prompt),
    };
  }

  const text = String(raw).trim();
  const pool = lang === 'km' ? TOPICS_KM : TOPICS_EN;
  const match = pool.find(
    (item) => item.prompt === text || item.title === text || text.toLowerCase().includes((item.title || '').toLowerCase())
  );

  if (match) {
    return {
      ...match,
      text: match.title,
      query: match.prompt,
    };
  }

  return {
    id: `topic_${Math.random().toString(36).slice(2, 8)}`,
    icon: getTopicIcon(text),
    title: text,
    text: text,
    prompt: text,
    query: text,
  };
}

/**
 * Generate a unique session ID.
 */
export function generateSessionId(prefix = 'session') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a new message data object.
 */
export function createChatMessage({
  role = 'user',
  sender,
  content = '',
  message,
  attachments = [],
  sources = [],
  suggestions = [],
  weather = null,
  currency = null,
  itinerary = null,
  recommendations = null,
  topic = '',
  isError = false,
}) {
  const finalRole = sender || role || 'user';
  const finalText = message !== undefined ? message : content;
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role: finalRole,
    sender: finalRole,
    content: finalText,
    message: finalText,
    attachments,
    sources,
    suggestions: (suggestions || []).map((s) => formatSuggestedTopic(s)),
    weather,
    currency,
    itinerary,
    recommendations,
    topic,
    isError,
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Default traveler profile for AngkorVers AI
 */
export const DEFAULT_USER_PROFILE = {
  name: 'Traveler',
  email: '',
  travelStyle: 'cultural',
  preferredDestinations: ['siem_reap'],
};

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


/**
 * Backwards compatibility helper for getLocalDynamicSuggestions
 */
export function getLocalDynamicSuggestions({ _message = '', _answer = '', language = 'en', refresh = false } = {}) {
  const pool = language === 'km' ? TOPICS_KM : TOPICS_EN;
  const shuffled = refresh ? [...pool].sort(() => Math.random() - 0.5) : pool;
  return {
    success: true,
    topic: language === 'km' ? 'ប្រធានបទណែនាំ' : 'SUGGESTED TOPICS',
    suggestions: shuffled.slice(0, 4).map((item) => ({
      ...item,
      text: item.title,
      query: item.prompt,
    })),
  };
}
