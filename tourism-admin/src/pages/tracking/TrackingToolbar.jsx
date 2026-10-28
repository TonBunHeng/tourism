import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function TrackingToolbar({
  totalCount,
  roleFilter = 'all',
  onRoleFilterChange,
  actionFilter = 'all',
  onActionFilterChange,
  periodFilter = 'all',
  onPeriodFilterChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title & Count Badge */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {t('tracking.allActivities', 'All Activities')}
          </h2>
          {totalCount !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {totalCount === 1 
                ? t('tracking.pillCountSingle', '1 activity') 
                : t('tracking.pillCount', '{count} activities', { count: totalCount })}
            </span>
          )}
        </div>

        {/* Right Controls Container: Role (Staff & Business only), Action, and Timeframe Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Role Filter Dropdown: Admin Staff, Content Editors, Business Owners only */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="all">{t('tracking.roleAll', 'All Roles')}</option>
              <option value="admin">{t('tracking.roleAdmin', 'Admin Staff')}</option>
              <option value="guide_editor">{t('tracking.roleGuideEditor', 'Content Editors')}</option>
              <option value="business_owner">{t('tracking.roleBusinessOwner', 'Business Owners')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Action Filter Dropdown */}
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => onActionFilterChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="all">{t('tracking.actionAll', 'All Actions')}</option>
              <option value="create">{t('tracking.actionCreate', 'Created (Items)')}</option>
              <option value="update">{t('tracking.actionUpdate', 'Updated (Edits)')}</option>
              <option value="delete">{t('tracking.actionDelete', 'Deleted (Removals)')}</option>
              <option value="approve">{t('tracking.actionApprove', 'Approved & Verified')}</option>
              <option value="reject">{t('tracking.actionReject', 'Rejected & Suspended')}</option>
              <option value="auth">{t('tracking.actionAuth', 'Logins & Sessions')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Timeframe Filter Dropdown */}
          <div className="relative">
            <select
              value={periodFilter}
              onChange={(e) => onPeriodFilterChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="all">{t('tracking.periodAll', 'All Time')}</option>
              <option value="today">{t('tracking.periodToday', 'Today')}</option>
              <option value="7d">{t('tracking.period7d', 'Past 7 Days')}</option>
              <option value="30d">{t('tracking.period30d', 'Past 30 Days')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
