import { Briefcase, Building2, CheckCircle2 } from 'lucide-react';

export default function BusinessesHeader({ totalCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 text-xs font-bold mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Hospitality & Tourism Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Local Tourism Businesses & Partners
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Explore top-rated boutique hotels, Khmer dining, tour operators, and transport providers across Cambodia
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="px-3.5 py-1.5 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 text-xs font-extrabold shadow-2xs border border-gray-200/60 dark:border-zinc-700/60">
          {totalCount} Verified Listings
        </span>
      </div>
    </div>
  );
}
