import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function EventsToolbar({
  selectedCategory = 'All',
  onCategoryChange = () => {},
  categories = ['All', 'Cultural', 'Festival', 'Sports', 'Food', 'Music', 'Exhibition'],
  selectedStatus = 'All',
  onStatusChange = () => {},
  statuses = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled', 'Scheduled'],
  totalCount
}) {
  const { t } = useLanguage();

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'All': return t('events.filterAllCategories', 'All Categories');
      case 'Cultural': return t('events.catCultural', 'Cultural');
      case 'Festival': return t('events.catFestival', 'Festival');
      case 'Sports': return t('events.catSports', 'Sports');
      case 'Food': return t('events.catFood', 'Food');
      case 'Music': return t('events.catMusic', 'Music');
      case 'Exhibition': return t('events.catExhibition', 'Exhibition');
      default: return cat;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'All': return t('events.filterAllStatuses', 'All Statuses');
      case 'Upcoming': return t('events.statusUpcoming', 'Upcoming');
      case 'Ongoing': return t('events.statusOngoing', 'Ongoing');
      case 'Completed': return t('events.statusCompleted', 'Completed');
      case 'Cancelled': return t('events.statusCancelled', 'Cancelled');
      case 'Scheduled': return t('events.statusScheduled', 'Scheduled');
      default: return status;
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {t('events.allEventsHeading', 'All Events')}
          </h2>
          {totalCount !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {totalCount} {totalCount === 1 ? t('events.eventSingular', 'event') : t('events.eventPlural', 'events')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
