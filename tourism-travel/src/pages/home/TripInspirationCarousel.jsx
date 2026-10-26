import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe2, ChevronRight, Compass } from 'lucide-react';

export default function TripInspirationCarousel() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('Anywhere');

  const destinations = [
    {
      id: 'anywhere',
      name: 'Anywhere',
      isGlobe: true,
      tag: 'Explore All',
      query: '',
    },
    {
      id: 'siem-reap',
      name: 'Siem Reap',
      tag: 'UNESCO Heritage',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
      query: 'Siem Reap',
    },
    {
      id: 'phnom-penh',
      name: 'Phnom Penh',
      tag: 'Capital City',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=400&q=80',
      query: 'Phnom Penh',
    },
    {
      id: 'koh-rong',
      name: 'Koh Rong',
      tag: 'Island & Beach',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
      query: 'Koh Rong',
    },
    {
      id: 'kampot',
      name: 'Kampot & Kep',
      tag: 'Nature & Seaside',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      query: 'Kampot',
    },
    {
      id: 'battambang',
      name: 'Battambang',
      tag: 'Colonial Arts',
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=400&q=80',
      query: 'Battambang',
    },
  ];

  const handleSelect = (dest) => {
    setSelectedCity(dest.name);
    if (dest.isGlobe) {
      navigate('/places');
    } else {
      navigate(`/places?search=${encodeURIComponent(dest.query)}`);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f294d] dark:text-white tracking-tight">
            Get inspired for your next trip
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Hand-picked Cambodian destinations for weekend getaways, heritage tours & island breaks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/provinces')}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#287dfa] hover:underline cursor-pointer"
        >
          <span>All 25 Provinces</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {destinations.map((dest) => {
          const isSelected = selectedCity === dest.name;

          if (dest.isGlobe) {
            return (
              <div
                key={dest.id}
                onClick={() => handleSelect(dest)}
                className={`relative h-28 sm:h-32 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'border-[#287dfa] ring-2 ring-blue-400/30'
                    : 'border-transparent hover:border-blue-300'
                } bg-gradient-to-br from-[#102a54] to-[#08152e] text-white shadow-xs`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                  <Globe2 size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-300 block">
                    {dest.tag}
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-tight leading-tight">
                    {dest.name}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={dest.id}
              onClick={() => handleSelect(dest)}
              className={`group relative h-28 sm:h-32 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'border-[#287dfa] ring-2 ring-blue-400/30'
                  : 'border-gray-100 dark:border-zinc-800 hover:border-[#287dfa]'
              } shadow-xs`}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Tag Top Left */}
              <div className="relative z-10">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-white/90 text-gray-900 shadow-2xs backdrop-blur-xs">
                  {dest.tag}
                </span>
              </div>

              {/* Name Bottom */}
              <div className="relative z-10 text-white">
                <span className="text-sm font-black tracking-tight drop-shadow-sm group-hover:text-blue-200 transition-colors">
                  {dest.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
