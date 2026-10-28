import { ChevronDown, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function DeletionToolbar({
  totalCount,
  selectedType = 'All',
  onTypeChange = () => {},
  types = ['All', 'account', 'item'],
  selectedStatus = 'All',
  onStatusChange = () => {},
  statuses = ['All', 'pending', 'approved', 'rejected'],
  selectedUrgency = 'All',
  onUrgencyChange = () => {},
  urgencies = ['All', 'critical', 'high', 'medium', 'low'],
  sortBy = 'newest',
  onSortChange = () => {},
  onClearFilters
}) {
  const { t } = useLanguage();
  const hasActiveFilters = selectedType !== 'All' || selectedStatus !== 'All' || selectedUrgency !== 'All' || sortBy !== 'newest';

  const getTypeLabel = (type) => {
    if (type === 'All') return t('deletion.typeAll', 'All Types');
    if (type === 'account') return t('deletion.typeAccount', 'Account');
    if (type === 'item') return t('deletion.typeItem', 'Item');
    return type;
  };

  const getStatusLabel = (status) => {
    if (status === 'All') return t('deletion.statusAll', 'All Statuses');
    const s = String(status).toLowerCase();
    if (s === 'pending') return t('deletion.statusPending', 'Pending');
    if (s === 'approved') return t('deletion.statusApproved', 'Approved');
    if (s === 'rejected') return t('deletion.statusRejected', 'Rejected');
    if (s === 'archived') return t('deletion.statusArchived', 'Archived');
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency === 'All') return t('deletion.urgencyAll', 'All Urgencies');
    const u = String(urgency).toLowerCase();
    if (u === 'critical') return t('deletion.urgencyCritical', 'Critical');
    if (u === 'high') return t('deletion.urgencyHigh', 'High');
    if (u === 'medium') return t('deletion.urgencyMedium', 'Medium');
    if (u === 'low') return t('deletion.urgencyLow', 'Low');
    return urgency.charAt(0).toUpperCase() + urgency.slice(1);
  };

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {t('deletion.allRequests', 'All Requests')}
          </h2>
          {totalCount !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {totalCount === 1 
                ? t('deletion.pillCountSingle', '1 request') 
                : t('deletion.pillCount', '{count} requests', { count: totalCount })}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {types.map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
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

          {/* Urgency Filter */}
          <div className="relative">
            <select
              value={selectedUrgency}
              onChange={(e) => onUrgencyChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {urgencies.map(urgency => (
                <option key={urgency} value={urgency}>{getUrgencyLabel(urgency)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="newest">{t('deletion.sortNewest', 'Newest First')}</option>
              <option value="oldest">{t('deletion.sortOldest', 'Oldest First')}</option>
              <option value="urgency">{t('deletion.sortUrgency', 'By Urgency')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
              title={t('deletion.titleReset', 'Reset all filters')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('deletion.btnReset', 'Reset')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
