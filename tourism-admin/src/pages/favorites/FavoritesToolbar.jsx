import React from 'react';
import { ChevronDown, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function FavoritesToolbar({
  totalCount = 0,
  selectedCount = 0,
  selectedCategory = 'All',
  onCategoryChange,
  setSelectedCategory,
  categories = ['All'],
  selectedStatus = 'All',
  onStatusChange,
  setSelectedStatus,
  statuses = ['All', 'Visited', 'To Visit'],
  sortBy = 'recent',
  onSortChange,
  setSortBy,
  onClearFilters,
  onBulkDelete,
  onBulkMarkVisited,
  onDeselectAll
}) {
  const { t } = useLanguage();
  const handleCategory = onCategoryChange || setSelectedCategory || (() => {});
  const handleStatus = onStatusChange || setSelectedStatus || (() => {});
  const handleSort = onSortChange || setSortBy || (() => {});

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== 'All') ||
    (selectedStatus && selectedStatus !== 'All') ||
    (sortBy && sortBy !== 'recent')
  );

  const handleReset = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      handleCategory('All');
      handleStatus('All');
      handleSort('recent');
    }
  };

  const getStatusLabel = (st) => {
    if (st === 'All') return t('favorites.allStatuses');
    if (st === 'Visited') return t('favorites.statusVisited');
    if (st === 'To Visit') return t('favorites.statusToVisit');
    return st;
  };

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Section title & counters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {t('favorites.savedDestinations')}
          </h2>
          {totalCount !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {totalCount === 1 ? t('favorites.pillCountSingle') : t('favorites.pillCount', { count: totalCount })}
            </span>
          )}
          {selectedCount > 0 && (
            <span className="text-xs font-semibold text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)] bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] border border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)] px-2.5 py-0.5 rounded-md animate-in fade-in">
              {t('favorites.selectedBadge', { count: selectedCount })}
            </span>
          )}
        </div>

        {/* Right: Controls & Filters */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategory(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? t('favorites.allCategories') : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatus(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {getStatusLabel(st)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="recent">{t('favorites.sortRecent')}</option>
              <option value="oldest">{t('favorites.sortOldest')}</option>
              <option value="highest">{t('favorites.sortHighest')}</option>
              <option value="lowest">{t('favorites.sortLowest')}</option>
              <option value="name">{t('favorites.sortName')}</option>
              <option value="most_reviews">{t('favorites.sortMostReviews')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
              title={t('favorites.resetBtn')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('favorites.resetBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar (Visible when items are selected) */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex-wrap animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('favorites.actionOnSelected', { count: selectedCount })}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onBulkMarkVisited && (
              <button
                type="button"
                onClick={onBulkMarkVisited}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)] hover:opacity-90 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('favorites.bulkMarkVisited')}</span>
              </button>
            )}

            {onBulkDelete && (
              <button
                type="button"
                onClick={onBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)] hover:opacity-90 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('favorites.bulkRemove')}</span>
              </button>
            )}

            {onDeselectAll && (
              <button
                type="button"
                onClick={onDeselectAll}
                className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] rounded-md transition-colors cursor-pointer border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
              >
                {t('favorites.deselectAll')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
