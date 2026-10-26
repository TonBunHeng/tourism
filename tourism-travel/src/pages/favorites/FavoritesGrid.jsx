import { Link } from 'react-router-dom';
import PlaceCard from '../../components/common/PlaceCard';
import { Heart } from 'lucide-react';

export default function FavoritesGrid({ favorites, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 transition-colors">
        <Heart className="w-12 h-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-800 dark:text-zinc-200">Your wishlist is empty</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Browse destinations and click the heart icon on any card to save it for your next trip.
        </p>
        <Link
          to="/places"
          className="inline-block mt-4 px-4 py-2 bg-[#003E83] dark:bg-[#60a5fa] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs"
        >
          Explore Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((fav) => (
        <PlaceCard key={fav.id || fav.place?.id} place={fav.place || fav} />
      ))}
    </div>
  );
}
