import { ChevronDown, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';

export default function DashboardHeader({
  timeRange,
  onTimeRangeChange,
  canViewReports = false,
}) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              {t('dashboard.overview', 'Dashboard')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('dashboard.liveSystem', 'Live System')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            {t('dashboard.subtitle', 'Real-time platform statistics, bookings queue, destinations, and system health.')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Timeframe Filter Dropdown */}
          <div className="relative">
            <select
              value={timeRange || 'yearly'}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="yearly">{t('dashboard.yearly', { year: currentYear }, 'A Year ({year})')}</option>
              <option value="monthly">{t('dashboard.monthly', 'A Month (30 Days)')}</option>
              <option value="weekly">{t('dashboard.weekly', 'A Week (7 Days)')}</option>
              <option value="today">{t('dashboard.today', 'A Day (Today)')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Go to Reports Button */}
          {canViewReports && (
            <Link
              to="/reports"
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm font-medium shadow-xs transition-colors cursor-pointer"
              title="View Tourism Reports & Analytics"
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{t('dashboard.viewReports', 'Reports')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
