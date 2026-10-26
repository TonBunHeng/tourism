import { Search, X, Calendar } from 'lucide-react';

export default function EventsHeader({ statusFilter, setStatusFilter, search, setSearch }) {
  const statuses = ['All', 'Upcoming', 'Ongoing', 'Past'];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Kingdom of Cambodia Cultural Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Events & Festivals
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-xl">
            Experience traditional Water Festivals, Khmer New Year celebrations, temple ceremonies, and music concerts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Status Capsule Switcher */}
          <div className="flex p-1.5 bg-gray-100/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-zinc-700/60 text-xs font-bold w-full sm:w-auto overflow-x-auto">
            {statuses.map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all duration-150 cursor-pointer text-center ${
                    isActive
                      ? 'bg-white dark:bg-zinc-700 text-[#003E83] dark:text-blue-300 shadow-xs'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search event title..."
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
      </div>
    </div>
  );
}
