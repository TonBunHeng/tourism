import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function RatingsToolbar({
  selectedStatus = 'All',
  onStatusChange,
  setSelectedStatus,
  statuses = ['All', 'Approved', 'Pending', 'Rejected'],
  selectedPlace = 'All',
  onPlaceChange,
  setSelectedPlace,
  places = ['All'],
  totalCount
}) {
  const { t } = useLanguage();

  const handleStatus = (val) => {
    if (onStatusChange) onStatusChange(val);
    if (setSelectedStatus) setSelectedStatus(val);
  };

  const handlePlace = (val) => {
    if (onPlaceChange) onPlaceChange(val);
    if (setSelectedPlace) setSelectedPlace(val);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'All': return t('ratings.allStatuses', 'All Status');
      case 'Approved': return t('ratings.statusApproved', 'Approved');
      case 'Pending': return t('ratings.statusPending', 'Pending');
      case 'Rejected': return t('ratings.statusRejected', 'Rejected');
      default: return status;
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {t('ratings.allReviews', 'All Reviews')}
          </h2>
          {totalCount !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {totalCount === 1
                ? t('ratings.reviewCountPillSingle', '1 review')
                : t('ratings.reviewCountPill', '{count} reviews').replace('{count}', totalCount)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Place Filter */}
          {places && places.length > 1 && (
            <div className="relative">
              <select
                value={selectedPlace}
                onChange={(e) => handlePlace(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
              >
                {places.map((place) => (
                  <option key={place} value={place}>
                    {place === 'All' ? t('ratings.allPlaces', 'All Places') : place}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>
          )}

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatus(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
