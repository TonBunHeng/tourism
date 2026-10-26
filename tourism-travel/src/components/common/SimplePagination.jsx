import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * SimplePagination
 * Clean, standard pagination component supporting Light and Dark themes.
 * Displays 10-page windows (1-10, 11-20, etc.) and record ranges (1-10, 11-20, etc.).
 */
export default function SimplePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  startIndex = 0,
  endIndex = 0,
  totalRecords = 0,
  label = 'records',
  className = '',
}) {
  if (!totalRecords || totalRecords <= 0) return null;

  // Safe range calculation
  const from = Math.min(startIndex + 1, totalRecords);
  const to = Math.min(endIndex, totalRecords);

  // Generate 10-page window (1-10, 11-20, 21-30, etc.)
  const startBlock = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const endBlock = Math.min(startBlock + 9, totalPages);

  const getPageNumbers = () => {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (startBlock > 1) {
      pages.push(1);
      if (startBlock > 2) {
        pages.push('...');
      }
    }

    for (let i = startBlock; i <= endBlock; i++) {
      pages.push(i);
    }

    if (endBlock < totalPages) {
      if (endBlock < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`
        flex flex-col sm:flex-row
        items-center justify-between
        gap-3
        px-5 py-3.5
        border border-gray-200/80 dark:border-zinc-800/80
        bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm
        rounded-2xl shadow-xs
        ${className}
      `}
    >
      {/* Record information: 1-10, 11-20, etc. */}
      <div className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-medium">
        Showing{' '}
        <span className="font-semibold text-gray-900 dark:text-white px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800/80">
          {from === to ? from.toLocaleString() : `${from.toLocaleString()}-${to.toLocaleString()}`}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalRecords.toLocaleString()}
        </span>{' '}
        {label}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          className="
            h-8.5 px-3
            flex items-center gap-1.5
            rounded-xl
            border border-gray-200 dark:border-zinc-700/80
            bg-white dark:bg-zinc-800/90
            text-xs font-semibold text-gray-700 dark:text-zinc-200
            hover:bg-gray-50 dark:hover:bg-zinc-700
            hover:border-gray-300 dark:hover:border-zinc-600
            disabled:opacity-35
            disabled:cursor-not-allowed
            shadow-2xs
            transition-all duration-150 active:scale-95
            cursor-pointer
          "
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Page numbers (1-10, 11-20, etc.) */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            const isLeftDots = index === 1;
            const targetPage = isLeftDots ? Math.max(1, startBlock - 1) : Math.min(totalPages, endBlock + 1);
            return (
              <button
                key={`dots-${index}`}
                type="button"
                onClick={() => onPageChange(targetPage)}
                title={isLeftDots ? `Go to page ${targetPage}` : `Go to page ${targetPage}`}
                className="
                  w-8.5 h-8.5
                  flex items-center justify-center
                  rounded-xl
                  border border-transparent
                  text-xs text-gray-400 dark:text-zinc-500
                  hover:border-gray-200 dark:hover:border-zinc-700
                  hover:bg-gray-100 dark:hover:bg-zinc-800
                  transition-colors
                  cursor-pointer
                "
              >
                ...
              </button>
            );
          }

          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`
                w-8.5 h-8.5
                flex items-center justify-center
                rounded-xl
                text-xs font-bold
                transition-all duration-150 active:scale-95
                cursor-pointer
                ${
                  isActive
                    ? 'bg-gradient-to-br from-[#003E83] to-blue-600 dark:from-blue-500 dark:to-indigo-600 text-white shadow-sm shadow-blue-900/20'
                    : 'border border-gray-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/90 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:border-gray-300 shadow-2xs'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="
            h-8.5 px-3
            flex items-center gap-1.5
            rounded-xl
            border border-gray-200 dark:border-zinc-700/80
            bg-white dark:bg-zinc-800/90
            text-xs font-semibold text-gray-700 dark:text-zinc-200
            hover:bg-gray-50 dark:hover:bg-zinc-700
            hover:border-gray-300 dark:hover:border-zinc-600
            disabled:opacity-35
            disabled:cursor-not-allowed
            shadow-2xs
            transition-all duration-150 active:scale-95
            cursor-pointer
          "
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
