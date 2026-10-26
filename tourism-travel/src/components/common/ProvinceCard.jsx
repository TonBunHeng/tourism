import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ExternalLink, Map as MapIcon, Image as ImageIcon, Users, Clock, Check } from 'lucide-react';

const PROVINCE_IMAGES = {
  'Siem Reap': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'Phnom Penh': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
  'Kampot': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'Preah Sihanouk': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'Battambang': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'Mondulkiri': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
  'Ratanakiri': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'Kep': 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
  'Preah Vihear': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  'Koh Kong': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  'Kratie': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'Kampong Thom': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  'Kampong Cham': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
  'Pursat': 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80',
  'Kandal': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  'Kampong Chhnang': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80',
  'Takeo': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  'Kampong Speu': 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80',
  'Stung Treng': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  'Banteay Meanchey': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  'Pailin': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
  'Prey Veng': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  'Svay Rieng': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'Oddar Meanchey': 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
  'Tboung Khmum': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80';

export default function ProvinceCard({ province }) {
  const [showLiveMap, setShowLiveMap] = useState(false);

  const mapQuery = encodeURIComponent(`${province.name}, Cambodia`);
  const embedMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=10&ie=UTF8&iwloc=&output=embed`;

  const imageSrc = province.image_url || province.image || PROVINCE_IMAGES[province.name] || DEFAULT_IMAGE;
  const attractionsCount = province.places_count || 12;

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Cover Media Frame */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
          {showLiveMap ? (
            <iframe
              title={`Map of ${province.name}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={embedMapUrl}
              className="w-full h-full"
            />
          ) : (
            <>
              <img
                src={imageSrc}
                alt={province.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            </>
          )}

          {/* Badge Top Left */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-[#2563eb] text-white shadow-sm">
              CAMBODIA PROVINCE
            </span>
          </div>

          {/* Duration / Map Switcher Top Right */}
          <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowLiveMap(!showLiveMap);
              }}
              className="px-3 py-1 text-xs font-bold rounded-full bg-white text-gray-900 shadow-sm flex items-center gap-1.5 border border-white/20 cursor-pointer"
              title={showLiveMap ? 'View Photo' : 'Interactive Map'}
            >
              {showLiveMap ? <ImageIcon size={13} className="text-[#2563eb]" /> : <MapIcon size={13} className="text-[#2563eb]" />}
              <span>{showLiveMap ? 'Photo' : 'Map'}</span>
            </button>
          </div>

          {/* Location & Attractions on Image */}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white text-xs font-bold drop-shadow-sm">
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <MapPin size={14} className="text-amber-400 shrink-0 fill-amber-400/20" />
              <span>{province.name}</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium shrink-0">
              <Users size={14} className="text-white/80" />
              <span>{attractionsCount} Attractions</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Review Rating Badge + Free Cancellation Tag */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#0f294d] text-white text-xs font-black">
                5.0
              </span>
              <span className="font-bold text-[#0f294d] dark:text-white text-sm">
                Excellent
              </span>
              <span className="text-xs text-gray-400 font-normal">
                (450)
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#ecfdf5] dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400 text-xs font-bold">
              Free Cancellation
            </span>
          </div>

          {/* Title */}
          <Link to={`/provinces/${province.id}`} className="block">
            <h3 className="text-lg font-black text-[#0f294d] dark:text-white group-hover:text-[#2563eb] transition-colors line-clamp-1 leading-snug">
              {province.name} Province Attractions
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {province.description || `Explore historical temples, cultural communities, and untouched nature in ${province.name}.`}
          </p>

          {/* Highlights Mini-list with 2 Green Checkmarks */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Top-rated historical landmarks & ecotourism sights</span>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Local tour operators with verified guest reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between bg-white dark:bg-zinc-900 rounded-b-3xl">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block leading-none mb-1">
            FROM
          </span>
          <div className="flex items-baseline">
            <span className="text-2xl font-black text-[#2563eb] dark:text-blue-400">
              Free
            </span>
            <span className="text-xs font-normal text-gray-500 ml-1">
              / explore
            </span>
          </div>
        </div>

        <Link
          to={`/provinces/${province.id}`}
          className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <span>Explore</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
