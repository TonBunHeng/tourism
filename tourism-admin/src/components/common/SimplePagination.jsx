import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * SimplePagination
 * Clean and minimal pagination component supporting Light and Dark themes.
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
  const from = totalRecords > 0 ? Math.min(startIndex + 1, totalRecords) : 0;
  const to = Math.max(from, Math.min(endIndex, totalRecords));

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
        px-4 py-3
        border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]
        bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]
        ${className}
      `}
    >
      {/* Record information: 1-10, 11-20, etc. */}
      <div className="text-sm text-gray-500 dark:text-zinc-400">
        Showing{' '}
        <span className="font-semibold text-gray-900 dark:text-white">
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
            h-8 px-3
            flex items-center gap-1
            rounded-md
            border border-gray-300 dark:border-zinc-700
            bg-white dark:bg-zinc-800
            text-sm text-gray-700 dark:text-zinc-200
            hover:bg-gray-50 dark:hover:bg-zinc-700
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition-colors
            cursor-pointer
          "
        >
          <ChevronLeft className="w-4 h-4" />
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
                  w-8 h-8
                  flex items-center justify-center
                  rounded-md
                  border border-transparent
                  text-sm text-gray-500 dark:text-zinc-400
                  hover:border-gray-300 dark:hover:border-zinc-700
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
                w-8 h-8
                flex items-center justify-center
                rounded-md
                border
                text-sm font-medium
                transition-colors
                cursor-pointer
                ${
                  isActive
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 font-semibold'
                    : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700'
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
            h-8 px-3
            flex items-center gap-1
            rounded-md
            border border-gray-300 dark:border-zinc-700
            bg-white dark:bg-zinc-800
            text-sm text-gray-700 dark:text-zinc-200
            hover:bg-gray-50 dark:hover:bg-zinc-700
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition-colors
            cursor-pointer
          "
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
