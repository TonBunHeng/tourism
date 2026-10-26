import { Search, X, MapPin } from 'lucide-react';

const SUGGESTIONS = ['Siem Reap', 'Phnom Penh', 'Kampot', 'Mondulkiri', 'Koh Kong'];

export default function ProvincesHeader({ search, setSearch }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Kingdom of Cambodia • 25 Administrative Regions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Provinces of Cambodia
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-xl">
            Explore diverse landscapes, ancient Angkorian temples, tropical coastlines, and highland biodiversity.
          </p>
        </div>

        {/* Modern Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search province, capital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-2xs focus:border-[#003E83] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#003E83]/20 dark:focus:ring-blue-500/20 focus:outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Location Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80 text-xs text-gray-500 dark:text-zinc-400">
        <span className="font-medium">Quick find:</span>
        {SUGGESTIONS.map((prov) => (
          <button
            key={prov}
            type="button"
            onClick={() => setSearch(prov)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              search.toLowerCase() === prov.toLowerCase()
                ? 'bg-[#003E83] text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:border-gray-300'
            }`}
          >
            {prov}
          </button>
        ))}
      </div>
    </div>
  );
}
