import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, MapPin, Sparkles, ChevronRight, Calendar, Users } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

const DEFAULT_TRENDING = [
  'Angkor Wat',
  'Siem Reap',
  'Phnom Penh',
  'Kampot & Bokor',
  'Koh Rong Island'
];

export default function HomeHero() {
  const navigate = useNavigate();
  const { provinces } = useTravel();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travelers, setTravelers] = useState(2);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const cleanDest = destination.trim();

    if (cleanDest) {
      params.append('search', cleanDest);

      // Check if user destination matches a known Cambodian province
      const matchedProvince = provinces.find(
        (p) => p.name?.toLowerCase() === cleanDest.toLowerCase()
      );
      if (matchedProvince) {
        params.append('province_id', String(matchedProvince.id));
      }
    }

    if (dates) {
      params.append('date', dates);
    }
    if (travelers > 1) {
      params.append('travelers', String(travelers));
    }

    navigate(`/places?${params.toString()}`);
  };

  const handleTrendingClick = (dest) => {
    const matched = provinces.find(
      (p) => p.name?.toLowerCase().includes(dest.toLowerCase()) || dest.toLowerCase().includes(p.name?.toLowerCase())
    );
    const params = new URLSearchParams();
    params.set('search', dest);
    if (matched) {
      params.set('province_id', String(matched.id));
    }
    navigate(`/places?${params.toString()}`);
  };

  // Derive trending destinations dynamically from live provinces or fallback
  const trendingList = provinces.length > 0
    ? provinces.slice(0, 5).map(p => p.name)
    : DEFAULT_TRENDING;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#002855] via-[#003E83] to-[#00224b] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50 transition-colors">
      {/* Background Cambodian Temple Silhouette & Ambient Light Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-r from-blue-400/20 via-sky-400/15 to-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-md border border-white/15 shadow-sm transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Kingdom of Wonder • Official Tourism Portal 2026</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-balance">
            Discover Ancient Heritage & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-blue-100 to-sky-200 bg-clip-text text-transparent">
              Tropical Wonders in Cambodia
            </span>
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Plan your next journey across all 25 provinces. Experience UNESCO world heritage temples, untouched island beaches, and vibrant cultural festivals.
          </p>
        </div>

        {/* Floating Modern Search Console: Destination, Dates, and Travelers */}
        <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl p-3 sm:p-4 max-w-4xl mx-auto shadow-2xl backdrop-blur-xl border border-white/30 dark:border-zinc-700/80 text-gray-900 dark:text-white text-left transition-all">
          <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            {/* 1. Destination Input */}
            <div className="sm:col-span-5 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3.5 pt-1">
                Where to?
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#003E83] dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  list="cambodia-provinces-list"
                  placeholder="Angkor Wat, Siem Reap, Koh Rong..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-transparent text-gray-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none"
                />
                <datalist id="cambodia-provinces-list">
                  {provinces.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* 2. Dates Input */}
            <div className="sm:col-span-3 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-zinc-800 pt-2 sm:pt-0 sm:pl-3 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 pt-1">
                Travel Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 bg-transparent text-gray-900 dark:text-white text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Travelers Input */}
            <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-zinc-800 pt-2 sm:pt-0 sm:pl-3 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 pt-1">
                Travelers
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-gray-400 absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                  className="w-full pl-7 pr-2 py-2 bg-transparent text-gray-900 dark:text-white text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Search Submit Button */}
            <div className="sm:col-span-2 pt-2 sm:pt-0">
              <button
                type="submit"
                className="w-full py-3 px-5 bg-gradient-to-r from-[#003E83] to-blue-600 hover:from-[#002e62] hover:to-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-blue-900/30 transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>Search</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Trending Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-blue-200 font-medium">Popular Highlights:</span>
          {trendingList.map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => handleTrendingClick(dest)}
              className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold backdrop-blur-sm border border-white/15 transition-all cursor-pointer"
            >
              {dest}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
