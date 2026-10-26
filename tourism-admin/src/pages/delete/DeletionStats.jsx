import { FileText, Clock, UserX, Trash2 } from 'lucide-react';

export default function DeletionStats({ requests = [] }) {
  const safeRequests = Array.isArray(requests) ? requests : [];
  const total = safeRequests.length;
  const pending = safeRequests.filter(r => r.status?.toLowerCase() === 'pending').length;
  const accountDeletions = safeRequests.filter(r => r.type?.toLowerCase() === 'account' || r.request_type === 'account').length;
  const itemDeletions = safeRequests.filter(r => r.type?.toLowerCase() === 'item' || r.request_type === 'item').length;

  const stats = [
    {
      label: 'Total Requests',
      value: total.toLocaleString(),
      subtext: 'Logged privacy & removal tickets',
      icon: FileText,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: 'Pending Reviews',
      value: pending.toLocaleString(),
      subtext: pending === 0 ? 'All tickets resolved' : `${pending} tickets awaiting admin action`,
      icon: Clock,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: 'Account Deletions',
      value: accountDeletions.toLocaleString(),
      subtext: 'GDPR / user erasure requests',
      icon: UserX,
      color: 'text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]',
      bg: 'bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)]'
    },
    {
      label: 'Item Deletions',
      value: itemDeletions.toLocaleString(),
      subtext: 'Specific content removal requests',
      icon: Trash2,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
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
