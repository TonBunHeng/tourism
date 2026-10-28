import { ShieldAlert, AlertTriangle, KeyRound, Activity } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function SecurityStats({ meta = {} }) {
  const { t } = useLanguage();

  const stats = [
    {
      label: t('security.statTotalIncidents', 'Total Incidents'),
      value: (meta.total_alerts || 0).toLocaleString(),
      subtext: t('security.subtextTotalIncidents', 'Security alerts generated'),
      icon: ShieldAlert,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: t('security.statUnreadAlerts', 'Unread Alerts'),
      value: (meta.unread_count || 0).toLocaleString(),
      subtext: (meta.unread_count || 0) === 0 
        ? t('security.subtextAllResolved', 'All alerts resolved') 
        : t('security.subtextAwaitingAttention', '{count} awaiting attention', { count: meta.unread_count }),
      icon: AlertTriangle,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: t('security.statHighRisk', 'High Risk (≥6 Tries)'),
      value: (meta.high_risk_count || 0).toLocaleString(),
      subtext: t('security.subtextHighRisk', 'Brute-force thresholds reached'),
      icon: KeyRound,
      color: 'text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]',
      bg: 'bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)]'
    },
    {
      label: t('security.statFailedLogins', 'Failed Logins Tracked'),
      value: (meta.failed_attempts || 0).toLocaleString(),
      subtext: t('security.subtextFailedLogins', 'Total recorded bad attempts'),
      icon: Activity,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                  {stat.label}
                </p>
                <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
