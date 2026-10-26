import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Landmark, 
  Trees, 
  Waves, 
  Castle, 
  Utensils, 
  Compass, 
  Building2, 
  Camera,
  Heart,
  ShoppingBag,
  Music,
  Tent
} from 'lucide-react';

const categoryIconsMap = {
  // Database canonical names
  'Temple': Landmark,
  'Historical Site': Landmark,
  'Palace': Castle,
  'Nature': Trees,
  'Museum': Landmark,
  'Dining': Utensils,
  'Resort & Hotel': Building2,
  'Adventure & Tour': Compass,
  'Cultural & Heritage': Castle,
  'Island & Beach': Waves,
  'Eco-Tourism & Wildlife': Trees,
  'Local Markets & Shopping': ShoppingBag,
  'Wellness & Spa': Heart,
  'Nightlife & Entertainment': Music,
  'Arts & Performance': Camera,

  // Fallback and variant keys
  'Historical Temples': Landmark,
  'Nature & Eco-tourism': Trees,
  'Beaches & Islands': Waves,
  'Cultural Heritage': Castle,
  'Culinary & Street Food': Utensils,
  'Hotels & Resorts': Building2,
  'Photography & Scenery': Camera,
};

const getCategoryIcon = (name = '') => {
  if (categoryIconsMap[name]) return categoryIconsMap[name];
  const lower = name.toLowerCase();
  if (lower.includes('temple') || lower.includes('historic') || lower.includes('ruin')) return Landmark;
  if (lower.includes('nature') || lower.includes('eco') || lower.includes('park') || lower.includes('wildlife')) return Trees;
  if (lower.includes('beach') || lower.includes('island') || lower.includes('sea') || lower.includes('water')) return Waves;
  if (lower.includes('dine') || lower.includes('food') || lower.includes('culinary') || lower.includes('restaurant')) return Utensils;
  if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay') || lower.includes('lodge')) return Building2;
  if (lower.includes('adventure') || lower.includes('tour') || lower.includes('trek')) return Compass;
  if (lower.includes('palace') || lower.includes('culture') || lower.includes('heritage')) return Castle;
  if (lower.includes('market') || lower.includes('shop')) return ShoppingBag;
  if (lower.includes('spa') || lower.includes('wellness')) return Heart;
  if (lower.includes('night') || lower.includes('music') || lower.includes('entertainment')) return Music;
  return Sparkles;
};

const getCategoryGradient = (name = '', customColor = null) => {
  const lower = name.toLowerCase();
  if (lower.includes('temple') || lower.includes('historic')) return 'from-amber-500/15 via-amber-500/5 to-transparent';
  if (lower.includes('nature') || lower.includes('eco')) return 'from-emerald-500/15 via-emerald-500/5 to-transparent';
  if (lower.includes('beach') || lower.includes('island')) return 'from-sky-500/15 via-sky-500/5 to-transparent';
  if (lower.includes('palace') || lower.includes('culture')) return 'from-indigo-500/15 via-indigo-500/5 to-transparent';
  if (lower.includes('dine') || lower.includes('food')) return 'from-rose-500/15 via-rose-500/5 to-transparent';
  if (lower.includes('adventure')) return 'from-blue-500/15 via-blue-500/5 to-transparent';
  if (lower.includes('wellness')) return 'from-teal-500/15 via-teal-500/5 to-transparent';
  return 'from-blue-500/10 via-blue-500/5 to-transparent';
};

export default function CategoriesGrid({ categories }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {categories.map((cat) => {
        const Icon = getCategoryIcon(cat.name);
        const gradient = getCategoryGradient(cat.name, cat.color);

        return (
          <Link
            key={cat.id}
            to={`/places?category_id=${cat.id}`}
            className="modern-card group relative bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-bl-full pointer-events-none transition-transform group-hover:scale-125`} />

            <div className="relative z-10">
              <div 
                className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 flex items-center justify-center mb-4 shadow-2xs group-hover:scale-110 group-hover:bg-[#003E83] group-hover:text-white transition-all"
                style={cat.color ? { color: cat.color } : {}}
              >
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors">
                {cat.name}
              </h3>

              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                {cat.description || 'Explore authentic Cambodian destinations and activities categorized under this theme.'}
              </p>
            </div>

            <div className="relative z-10 pt-5 mt-5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-[#003E83] dark:text-blue-400">
              <span className="text-[11px] text-gray-400 font-semibold">
                {cat.places_count !== undefined ? `${cat.places_count} Attractions` : 'View Attractions'}
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
