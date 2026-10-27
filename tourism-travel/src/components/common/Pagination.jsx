import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  perPage = 15,
  onPageChange,
  className = '',
}) {
  if (lastPage <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-xs text-slate-500 dark:text-zinc-400 ${className}`}>
      <div>
        Showing{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {Math.min((currentPage - 1) * perPage + 1, total)}
        </span>{' '}
        to{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {Math.min(currentPage * perPage, total)}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span>{' '}
        results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-700 transition"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="px-3 py-1 font-medium text-slate-700 dark:text-slate-200">
          Page {currentPage} of {lastPage}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-700 transition"
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
