import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Check, ArrowRight, Heart } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

export default function PlaceCard({ place }) {
  if (!place) return null;

  const { isFavorite, toggleFavorite } = useTravel();
  const favorited = isFavorite(place.id);
  const imageUrl = place.image_url || place.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80';

  const ratingVal = place.rating ? Number(place.rating).toFixed(1) : '5.0';
  const badgeLabel = place.category || 'MUST-VISIT';
  const locationLabel = place.province || place.location || 'Cambodia';
  const reviewsCount = place.reviews_count || 280;
  const priceVal = place.price ? (String(place.price).startsWith('$') ? place.price : `$${place.price}`) : 'Free';

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Cover Photo Frame */}
        <Link to={`/places/${place.id}`} className="block relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badge Top Left */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-[#2563eb] text-white shadow-sm">
              {badgeLabel}
            </span>
          </div>

          {/* Duration / Status Top Right & Favorite */}
          <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-white text-gray-900 shadow-sm flex items-center gap-1.5 border border-white/20">
              <Clock size={14} className="text-[#2563eb]" />
              <span>Full Day</span>
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(place);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm backdrop-blur-md active:scale-90 ${
                favorited
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-white/90 text-gray-700 hover:text-rose-500'
              }`}
              title={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={14} className={favorited ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Location & Guests on Image */}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white text-xs font-bold drop-shadow-sm">
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <MapPin size={14} className="text-amber-400 shrink-0 fill-amber-400/20" />
              <span>{locationLabel}</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium shrink-0">
              <Users size={14} className="text-white/80" />
              <span>All Travelers</span>
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Review Rating Badge + Free Cancellation Tag */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#0f294d] text-white text-xs font-black">
                {ratingVal}
              </span>
              <span className="font-bold text-[#0f294d] dark:text-white text-sm">
                Excellent
              </span>
              <span className="text-xs text-gray-400 font-normal">
                ({reviewsCount})
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#ecfdf5] dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400 text-xs font-bold">
              Free Cancellation
            </span>
          </div>

          {/* Title */}
          <Link to={`/places/${place.id}`} className="block">
            <h3 className="text-lg font-black text-[#0f294d] dark:text-white group-hover:text-[#2563eb] transition-colors line-clamp-1 leading-snug">
              {place.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {place.description || 'Discover remarkable ancient heritage, scenic landscapes, and cultural wonders across Cambodia.'}
          </p>

          {/* Highlights Mini-list with 2 Green Checkmarks */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Authentic UNESCO World Heritage & local cultural immersion</span>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Verified traveler ratings with instant online reservation</span>
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
              {priceVal}
            </span>
            <span className="text-xs font-normal text-gray-500 ml-1">
              / person
            </span>
          </div>
        </div>

        <Link
          to={`/places/${place.id}`}
          className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <span>View Details</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
