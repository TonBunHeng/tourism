import { Compass, MapPin } from 'lucide-react';

export default function PlacesHeader({ totalCount, provinceName }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>AngkorVerses Destination Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {provinceName ? `Attractions in ${provinceName}` : 'Discover Heritage Sites & Attractions'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-xl">
            {provinceName 
              ? `Browse and search heritage sites and attractions in ${provinceName}`
              : 'Browse and search heritage sites, sacred temples, and natural wonders across Cambodia'}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700/80 shadow-2xs self-start sm:self-auto">
          <span className="text-xs text-gray-500 dark:text-zinc-400">Total:</span>
          <span className="text-xs font-extrabold text-[#003E83] dark:text-blue-400">{totalCount} attractions</span>
        </div>
      </div>
    </div>
  );
}
