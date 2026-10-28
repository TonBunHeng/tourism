import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function DeletionAlert({ requests = [] }) {
  const { t } = useLanguage();
  const safeRequests = Array.isArray(requests) ? requests : [];
  const criticalCount = safeRequests.filter(r => r.urgency === 'critical' && r.status === 'pending').length;

  if (criticalCount === 0) return null;

  return (
    <div className="bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)] rounded-md p-4 mb-6 md:mb-8 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]">
          {t('deletion.alertCriticalTitle', '{count} Critical Request(s) Need Immediate Attention', { count: criticalCount })}
        </p>
        <p className="text-xs text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] mt-0.5">
          {t('deletion.alertCriticalSubtext', 'These requests require urgent action due to security or privacy concerns')}
        </p>
      </div>
    </div>
  );
}
