import {
  ShieldAlert,
  Clock,
  Mail,
  Globe,
  Trash2,
  Eye,
  Check,
  Lock,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { useLanguage } from '../../i18n';

const getStatusBadge = (isRead, isBlocked) => {
  if (isBlocked) {
    return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
  }
  return isRead
    ? 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]'
    : 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]';
};

const getSeverityBadge = (attempts) => {
  if (attempts >= 6) {
    return 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]';
  }
  return 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]';
};

export default function SecurityList({
  alerts = [],
  loading,
  onOpenDetails,
  onMarkRead,
  onDeleteAlert,
  startIndex = 0
}) {
  const { t } = useLanguage();

  if (loading) return null;

  const formatTimeAgo = (dateString) => {
    if (!dateString) return t('security.timeRecent', 'Recent');
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return t('security.timeJustNow', 'Just now');
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return t('security.timeMinAgo', '{min}m ago', { min: diffMin });
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return t('security.timeHourAgo', '{hour}h ago', { hour: diffHour });
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays === 1) return t('security.timeYesterday', 'Yesterday');
      if (diffDays < 7) return t('security.timeDaysAgo', '{days}d ago', { days: diffDays });
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusText = (isRead, isBlocked) => {
    if (isBlocked) return t('security.badgeIpBlocked', 'IP Blocked');
    if (isRead) return t('security.badgeAcknowledged', 'Acknowledged');
    return t('security.badgeActiveAlert', 'Active Alert');
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            return (
              <div
                key={alert.id}
                onClick={() => onOpenDetails(alert)}
                className={`p-4 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer ${
                  !alert.is_read ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)] flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {alert.email}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${getStatusBadge(alert.is_read, alert.is_ip_blocked)}`}>
                        {getStatusText(alert.is_read, alert.is_ip_blocked)}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 line-clamp-2">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Globe className="w-3.5 h-3.5" />
                        {alert.ip_address || '127.0.0.1'}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getSeverityBadge(alert.attempts)}`}>
                        {t('security.failedAttemptsCount', '{count} Failed Attempts', { count: alert.attempts })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeAgo(alert.created_at)}
                      </span>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onOpenDetails(alert)}
                        className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-colors cursor-pointer"
                        title={t('security.tooltipViewDetails', 'View Details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!alert.is_read && (
                        <button
                          type="button"
                          onClick={() => onMarkRead(alert.id)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors cursor-pointer"
                          title={t('security.tooltipAcknowledge', 'Acknowledge')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteAlert(alert.id)}
                        className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                        title={t('security.tooltipDelete', 'Delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
              {t('security.noAlertsFound', 'No security alerts found')}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('security.noAlertsSubtext', 'Authentication attacks and threshold alarms will appear here.')}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Responsive Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-auto">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
            <tr>
              <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                {t('security.thIndex', '#')}
              </th>
              <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('security.thTargetAccount', 'Target Account & Incident')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-36">
                {t('security.thSourceIP', 'Source IP')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                {t('security.thFailures', 'Failures')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
                {t('security.thStatus', 'Status')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-24">
                {t('security.thTime', 'Time')}
              </th>
              <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-24 whitespace-nowrap">
                {t('security.thActions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => {
                return (
                  <tr
                    key={alert.id}
                    className={`hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group ${
                      !alert.is_read ? 'bg-red-50/15 dark:bg-red-950/10' : ''
                    }`}
                  >
                    <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)] flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {alert.email}
                            </p>
                            {alert.is_ip_blocked && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-red-600 text-white shrink-0">
                                {t('security.badgeBlocked', 'Blocked')}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate max-w-[220px] md:max-w-md">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap text-xs font-mono text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[var(--color-text-muted-light)] shrink-0" />
                        <span className={alert.is_ip_blocked ? 'text-red-500 font-bold' : ''}>
                          {alert.ip_address || '127.0.0.1'}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md border ${getSeverityBadge(alert.attempts)}`}>
                        <Lock className="w-3 h-3 shrink-0" />
                        {t('security.attemptsCount', '{count} Attempts', { count: alert.attempts })}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusBadge(alert.is_read, alert.is_ip_blocked)}`}>
                        {alert.is_ip_blocked ? (
                          <>
                            <Ban className="w-3 h-3 text-red-500 shrink-0" />
                            <span>{t('security.badgeIpBlocked', 'IP Blocked')}</span>
                          </>
                        ) : !alert.is_read ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-md bg-red-500 animate-pulse shrink-0" />
                            <span>{t('security.badgeActiveAlert', 'Active Alert')}</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-md bg-slate-400 shrink-0" />
                            <span>{t('security.badgeAcknowledged', 'Acknowledged')}</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted-light)] shrink-0" />
                        <span>{formatTimeAgo(alert.created_at)}</span>
                      </div>
                    </td>

                    <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-xs text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenDetails(alert)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-colors cursor-pointer"
                          title={t('security.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!alert.is_read && (
                          <button
                            type="button"
                            onClick={() => onMarkRead(alert.id)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors cursor-pointer"
                            title={t('security.tooltipAcknowledge', 'Acknowledge')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                          title={t('security.tooltipDelete', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12">
                  <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                    {t('security.noAlertsFound', 'No security alerts found')}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {t('security.allSafeSubtext', 'All authentication records are safe and within normal limits.')}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
