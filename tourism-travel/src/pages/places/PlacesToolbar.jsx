import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

export default function PlacesToolbar({
  search,
  setSearch,
  provinceId,
  setProvinceId,
  categoryId,
  setCategoryId,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
  onApply,
  onClear,
  hasFilters,
}) {
  const { categories, provinces } = useTravel();

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700/80 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={provinceId}
            onChange={(e) => setProvinceId(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700/80 appearance-none focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none cursor-pointer transition-all"
          >
            <option value="">All Provinces (25)</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700/80 appearance-none focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none cursor-pointer transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700/80 appearance-none focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none cursor-pointer transition-all"
          >
            <option value="">Any Rating</option>
            <option value="4.8">4.8+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700/80 appearance-none focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none cursor-pointer transition-all"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviewed</option>
            <option value="newest">Newest Added</option>
            <option value="name">Alphabetical</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-zinc-500 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Refine by province, rating, or category</span>
          </div>
        )}

        <button
          type="button"
          onClick={onApply}
          className="px-5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-900/20 transition-all active:scale-95 cursor-pointer ml-auto sm:ml-0"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
