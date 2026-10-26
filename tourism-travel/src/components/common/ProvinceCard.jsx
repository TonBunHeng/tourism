import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ExternalLink, Map as MapIcon, Image as ImageIcon, Users, Maximize2 } from 'lucide-react';

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
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const imageSrc = province.image_url || province.image || PROVINCE_IMAGES[province.name] || DEFAULT_IMAGE;

  return (
    <div className="group modern-card bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 flex flex-col justify-between h-full transition-all">
      <div>
        {/* Cover Media Frame with Live Map Toggle */}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            </>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 text-gray-800 dark:text-zinc-200 shadow-sm backdrop-blur-md border border-white/20 dark:border-zinc-700">
              {province.type || 'Province'}
            </span>
          </div>

          {/* Control Switchers: Map / Photo Toggle & External Google Maps Link */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowLiveMap(!showLiveMap);
              }}
              className="px-2 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold backdrop-blur-md transition-colors flex items-center gap-1 cursor-pointer"
              title={showLiveMap ? 'View Photo' : 'Interactive Map'}
            >
              {showLiveMap ? <ImageIcon size={11} /> : <MapIcon size={11} />}
              <span>{showLiveMap ? 'Photo' : 'Map'}</span>
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] backdrop-blur-md transition-colors"
              title="Open in Google Maps"
            >
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Bottom Title on Image */}
          {!showLiveMap && (
            <div className="absolute bottom-2.5 left-3 z-10 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 flex items-center gap-1">
                <MapPin size={10} /> Cambodia
              </span>
            </div>
          )}
        </div>

        {/* Province Information Body */}
        <div className="p-5 space-y-2">
          <Link to={`/provinces/${province.id}`} className="block">
            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors">
              {province.name}
            </h3>
          </Link>

          {province.description ? (
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {province.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
              Discover historical landmarks, national parks, and local culture.
            </p>
          )}

          {/* Micro Stats Pills */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60">
              <Users size={12} className="text-blue-500 shrink-0" />
              <span className="truncate">
                {province.population ? province.population : 'Major Pop.'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60">
              <Maximize2 size={12} className="text-amber-500 shrink-0" />
              <span className="truncate">
                {province.area ? province.area : 'Landmark'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium bg-gray-50/70 dark:bg-zinc-800/40">
        <span className="text-gray-500 dark:text-zinc-400 font-semibold">
          {province.places_count || 0} Attractions
        </span>
        <Link
          to={`/provinces/${province.id}`}
          className="inline-flex items-center gap-1.5 font-bold text-[#003E83] dark:text-blue-400 hover:underline group-hover:translate-x-1 transition-transform"
        >
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
