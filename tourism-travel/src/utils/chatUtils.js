import { 
  Hotel, 
  Compass, 
  Car, 
  Landmark, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

export const TRIP_GENIE_SUGGESTIONS = [
  {
    category: 'Hotels',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50',
    icon: Hotel,
    question: 'Are there any boutique resorts in Siem Reap ideal for relaxation?',
  },
  {
    category: 'Inspiration',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
    icon: Compass,
    question: 'How can I make the most of a 3-day itinerary in Angkor & Siem Reap?',
  },
  {
    category: 'Transit',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50',
    icon: Car,
    question: 'How do Tuk-Tuks and PassApp rides work from Phnom Penh airport?',
  },
  {
    category: 'Attractions',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/50',
    icon: Landmark,
    question: 'How do I book guided sunrise tours or passes to Angkor Wat in advance?',
  },
  {
    category: 'Inspiration',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50',
    icon: Sparkles,
    question: 'What authentic Khmer dishes and street foods should I not miss?',
  },
  {
    category: 'Travel Tips',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
    icon: ShieldAlert,
    question: 'What is the dress code and etiquette when visiting ancient temples?',
  },
];

export function generateSessionId(prefix = 'genie') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createChatMessage({ role, content, isError = false }) {
  return {
    id: `${role}_${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    isError,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
