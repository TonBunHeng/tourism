import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';
import { useAuth } from '../../context/AuthContext';
import FavoritesHeader from './FavoritesHeader';
import FavoritesGrid from './FavoritesGrid';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

export default function Favorites() {
  const { favorites, fetchFavorites } = useTravel();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-10 sm:p-12 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/50 shadow-2xs">
            <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Your Saved Wishlist</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">
              Sign in to save and sync your dream destinations across all devices.
            </p>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-2.5 bg-gradient-to-r from-[#003E83] to-blue-700 hover:from-[#002e62] hover:to-blue-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            Sign In to View Wishlist
          </button>
        </div>
      </div>
    );
  }

  const visitedCount = favorites.filter((f) => f.visited).length;

  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, favorites.length);
  const paginatedFavorites = favorites.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Saved Wishlist' }]} />
      <FavoritesHeader totalCount={favorites.length} visitedCount={visitedCount} />
      <FavoritesGrid favorites={paginatedFavorites} />

      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={favorites.length}
        label="wishlist destinations"
        className="rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs"
      />
    </div>
  );
}
