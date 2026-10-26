import {
  ShieldAlert,
  Clock,
  Mail,
  Globe,
  Trash2,
  Lock,
  ChevronRight,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export default function SecurityGrid({
  alerts = [],
  loading,
  onOpenDetails,
  onMarkRead,
  onDeleteAlert
}) {
  if (loading) return null;

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
        <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
          No security alerts found
        </h3>
        <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
          All authentication records are safe and within normal limits.
        </p>
      </div>
    );
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffSec = Math.floor((now - date) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {alerts.map((alert) => {
        const timeAgo = formatTimeAgo(alert.created_at);
        const isHighRisk = (alert.attempts || 0) >= 6;

        return (
          <div
            key={alert.id}
            onClick={() => onOpenDetails(alert)}
            className={`p-4 rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-xs cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
              !alert.is_read ? 'ring-1 ring-red-500/30' : ''
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/50">
                    {alert.type || 'Alert'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo}</span>
                </div>
              </div>

              {/* Message */}
              <h4 className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] leading-snug line-clamp-2">
                {alert.message}
              </h4>

              {/* Data attributes */}
              <div className="mt-4 p-3 rounded-md bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5" />
                    Target:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">
                    {alert.email}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Globe className="w-3.5 h-3.5" />
                    IP Address:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {alert.ip_address || '127.0.0.1'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    Failed Attempts:
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {alert.attempts} tries
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between text-xs">
              <span className={`font-semibold ${alert.is_read ? 'text-slate-400' : 'text-red-500 flex items-center gap-1.5'}`}>
                {!alert.is_read && <span className="w-1.5 h-1.5 rounded-md bg-red-500 animate-pulse" />}
                {alert.is_read ? 'Read' : 'Action Required'}
              </span>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onDeleteAlert(alert.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDetails(alert)}
                  className="p-1.5 rounded-md text-[#003E83] dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Details"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
