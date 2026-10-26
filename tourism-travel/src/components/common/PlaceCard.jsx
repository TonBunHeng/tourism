import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

const PlaceCard = ({ place }) => {
  const { isFavorite, toggleFavorite } = useTravel();
  const favorited = isFavorite(place.id);
  const imageUrl = place.image_url || place.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group modern-card bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 flex flex-col justify-between h-full transition-all">
      <div>
        {/* Cover Photo Frame */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Favorite Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(place);
            }}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm backdrop-blur-md active:scale-90 ${
              favorited
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-white/90 dark:bg-zinc-900/90 text-gray-700 dark:text-zinc-200 hover:text-rose-500'
            }`}
            title={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>

          {/* Category Tag */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 text-gray-800 dark:text-zinc-200 shadow-sm backdrop-blur-md border border-white/20 dark:border-zinc-700">
              {place.category || 'Attraction'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400 shrink-0" />
              <span className="truncate max-w-[160px] font-medium">{place.province || 'Cambodia'}</span>
            </span>

            <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(place.rating || 5.0).toFixed(1)}</span>
              <span className="text-[10px] text-gray-400 font-normal">
                ({place.reviews_count || 0})
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {place.name}
          </h3>

          {place.description && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {place.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs bg-gray-50/70 dark:bg-zinc-800/40">
        <span className="font-extrabold text-[#003E83] dark:text-blue-400">
          {place.price || 'Free Admission'}
        </span>
        <Link
          to={`/places/${place.id}`}
          className="inline-flex items-center gap-1 font-bold text-[#003E83] dark:text-blue-400 hover:underline group-hover:translate-x-1 transition-transform"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default PlaceCard;
