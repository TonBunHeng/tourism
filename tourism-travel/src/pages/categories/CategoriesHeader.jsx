import { Sparkles, Layers } from 'lucide-react';

export default function CategoriesHeader({ totalCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 text-xs font-bold mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Travel Themes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Tourism Themes & Categories
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Explore the Kingdom of Cambodia through heritage temples, pristine beaches, culinary trails, and eco-reserves
        </p>
      </div>
      {totalCount !== undefined && (
        <span className="px-3.5 py-1.5 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 text-xs font-extrabold shadow-2xs border border-gray-200/60 dark:border-zinc-700/60 self-start sm:self-auto">
          {totalCount} Active Categories
        </span>
      )}
    </div>
  );
}
