import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n';

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
  const { t } = useLanguage();
  const recordCount = Number(totalRecords);
  if (!Number.isFinite(recordCount) || recordCount <= 0) return null;
  const pageCount = Math.max(1, Math.floor(Number(totalPages) || 1));
  const page = Math.min(pageCount, Math.max(1, Math.floor(Number(currentPage) || 1)));

  // Safe range calculation
  const rangeStart = Math.max(0, Number(startIndex) || 0);
  const rangeEnd = Math.min(Math.max(rangeStart, Number(endIndex) || 0), recordCount);
  const from = rangeStart < recordCount ? rangeStart + 1 : 0;
  const to = from ? Math.max(from, rangeEnd) : 0;

  // Generate 10-page window (1-10, 11-20, 21-30, etc.)
  const startBlock = Math.floor((page - 1) / 10) * 10 + 1;
  const endBlock = Math.min(startBlock + 9, pageCount);

  const getPageNumbers = () => {
    if (pageCount <= 10) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
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

    if (endBlock < pageCount) {
      if (endBlock < pageCount - 1) {
        pages.push('...');
      }
      pages.push(pageCount);
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
        {t('common.paginationShowing', 'Showing')}{' '}
        <span className="font-semibold text-gray-900 dark:text-white">
          {from === to ? from.toLocaleString() : `${from.toLocaleString()}-${to.toLocaleString()}`}
        </span>{' '}
        {t('common.paginationOf', 'of')}{' '}
        <span className="font-semibold text-gray-900 dark:text-white">
          {recordCount.toLocaleString()}
        </span>{' '}
        {label}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(page - 1, 1))}
          disabled={page <= 1}
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
          <span>{t('common.previous', 'Previous')}</span>
        </button>

        {/* Page numbers (1-10, 11-20, etc.) */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            const isLeftDots = index === 1;
            const targetPage = isLeftDots ? Math.max(1, startBlock - 1) : Math.min(pageCount, endBlock + 1);
            return (
              <button
                key={`dots-${index}`}
                type="button"
                onClick={() => onPageChange?.(targetPage)}
                title={t('common.paginationGoToPage', { page: targetPage }, `Go to page ${targetPage}`)}
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

          const isActive = pageNum === page;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange?.(pageNum)}
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
          onClick={() => onPageChange?.(Math.min(page + 1, pageCount))}
          disabled={page >= pageCount}
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
          <span>{t('common.next', 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
