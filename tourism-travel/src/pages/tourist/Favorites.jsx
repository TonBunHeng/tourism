import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Trash2, 
  CheckCircle
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Favorites() {
  const { showSuccess, showError, showConfirm } = useAlert();

  const [favorites, setFavorites] = useState([]);
  const [filterVisited, setFilterVisited] = useState('all'); // 'all', 'visited', 'unvisited'
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const ITEMS_PER_PAGE = 9;

  const fetchFavorites = () => {
    setIsLoading(true);
    travelService.getFavorites()
      .then((res) => {
        if (res?.success) {
          const list = res.data?.favorites || res.data || [];
          setFavorites(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load favorites:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (e, placeId) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = await showConfirm({
      title: 'Remove Favorite',
      message: 'Remove this destination from your saved wishlist?',
      confirmText: 'Remove',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await travelService.removeFavorite(placeId);
      if (res?.success) {
        showSuccess('Destination removed from wishlist.');
        fetchFavorites();
      }
    } catch {
      showError('Failed to remove favorite.');
    }
  };

  const handleToggleVisited = async (e, favId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await travelService.toggleVisited(favId);
      if (res?.success) {
        fetchFavorites();
      }
    } catch {
      showError('Failed to update visited status.');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterVisited]);

  const filteredFavorites = favorites.filter((f) => {
    if (filterVisited === 'visited') return Boolean(f.visited);
    if (filterVisited === 'unvisited') return !f.visited;
    return true;
  });

  const totalPages = Math.ceil(filteredFavorites.length / ITEMS_PER_PAGE);
  const paginatedFavorites = filteredFavorites.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Personal Wishlist
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Saved Destinations</span>
            <Heart size={24} className="text-rose-500 fill-rose-500" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Keep track of the Cambodian landmarks, temples, and places you wish to visit.
          </p>
        </div>

        <Link
          to="/destinations"
          className="px-4 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-sm transition self-start sm:self-auto"
        >
          Discover More Places
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold overflow-x-auto w-fit">
        {[
          { key: 'all', label: `All (${favorites.length})` },
          { key: 'unvisited', label: 'Wishlist (To Visit)' },
          { key: 'visited', label: 'Visited', icon: CheckCircle },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterVisited(tab.key)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filterVisited === tab.key
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.icon && <tab.icon size={13} />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Favorites List */}
      {isLoading ? (
        <LoadingSpinner text="Loading saved places..." />
      ) : filteredFavorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved places yet"
          description="Browse destinations across Cambodia and tap the heart icon to save places to your wishlist."
          action={
            <Link
              to="/destinations"
              className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-sm"
            >
              Browse Destinations
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedFavorites.map((fav) => {
              const place = fav.place || fav;
              const placeId = fav.place_id || fav.id;

              return (
                <div
                  key={fav.id || placeId}
                  className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-52 w-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={place.image_url || place.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, placeId)}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 backdrop-blur-md text-white transition cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <button
                        type="button"
                        onClick={(e) => handleToggleVisited(e, fav.id || placeId)}
                        className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          fav.visited
                            ? 'bg-emerald-600/90 text-white shadow-sm'
                            : 'bg-black/60 text-white/90 hover:bg-black/80'
                        }`}
                      >
                        <CheckCircle size={12} className={fav.visited ? 'text-white' : 'text-slate-400'} />
                        <span>{fav.visited ? 'Visited' : 'Mark Visited'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-[#002D62] dark:text-blue-400 font-semibold mb-1">
                        <MapPin size={12} />
                        <span>{place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || place.location || 'Cambodia'}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {place.entrance_fee || place.price || 'Free Entry'}
                      </span>
                      <Link
                        to={`/destinations/${placeId}`}
                        className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            lastPage={totalPages}
            total={filteredFavorites.length}
            perPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
}
