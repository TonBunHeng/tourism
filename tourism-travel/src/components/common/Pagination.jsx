import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  perPage = 9,
  onPageChange,
  className = '',
}) {
  if (lastPage <= 1) return null;

  const from = Math.min((currentPage - 1) * perPage + 1, total);
  const to = Math.min(currentPage * perPage, total);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', lastPage);
      } else if (currentPage >= lastPage - 3) {
        pages.push(1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage);
      }
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (typeof page === 'number' && page !== currentPage && page >= 1 && page <= lastPage) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 ${className}`}>
      <div>
        Showing{' '}
        <span className="font-bold text-slate-800 dark:text-zinc-200">
          {from}
        </span>{' '}
        to{' '}
        <span className="font-bold text-slate-800 dark:text-zinc-200">
          {to}
        </span>{' '}
        of{' '}
        <span className="font-bold text-slate-800 dark:text-zinc-200">{total}</span>{' '}
        results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition font-semibold"
          aria-label="Previous Page"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 font-bold select-none">
                  ...
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => handlePageClick(page)}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-[#002D62] text-white shadow-xs'
                    : 'border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition font-semibold"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
