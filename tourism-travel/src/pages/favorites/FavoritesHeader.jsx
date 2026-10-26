import { Heart, Sparkles } from 'lucide-react';

export default function FavoritesHeader({ totalCount, count, visitedCount = 0 }) {
  const displayCount = totalCount !== undefined ? totalCount : (count || 0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>Curated Travel Wishlist</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Saved Destinations & Favorites
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Your personal collection of Cambodian temples, eco-retreats, coastal islands, and culinary spots
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span className="px-3.5 py-1.5 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 text-xs font-extrabold shadow-2xs border border-gray-200/60 dark:border-zinc-700/60">
          {displayCount} Saved {displayCount === 1 ? 'Attraction' : 'Attractions'}
        </span>
        {visitedCount > 0 && (
          <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold shadow-2xs border border-emerald-200/60 dark:border-emerald-800/60">
            {visitedCount} Visited
          </span>
        )}
      </div>
    </div>
  );
}
