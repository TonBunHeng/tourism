import { useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Clock,
  Mail,
  Globe,
  AlertOctagon,
  Trash2,
  Laptop,
  Check,
  ShieldCheck,
  Lock,
  Ban,
  ShieldOff
} from 'lucide-react';

export default function SecurityDetailsModal({
  isOpen,
  alert,
  onClose,
  onMarkRead,
  onDelete,
  onBlockIp,
  onUnblockIp
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !alert) return null;

  const data = typeof alert.data === 'string'
    ? (() => { try { return JSON.parse(alert.data); } catch { return {}; } })()
    : (alert.data || {});

  const formattedDate = (() => {
    if (!alert.created_at) return 'Recent';
    try {
      const d = new Date(alert.created_at);
      if (isNaN(d.getTime())) return String(alert.created_at);
      return d.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium'
      });
    } catch {
      return String(alert.created_at);
    }
  })();

  const isHighRisk = (alert.attempts || 0) >= 6;
  const isBlocked = !!alert.is_ip_blocked;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark-modal)] border border-gray-200 dark:border-zinc-800 rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-alert-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-md border bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                  {alert.type || 'Failed Login Alert'}
                </span>
                {isHighRisk && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">
                    High Risk Threshold
                  </span>
                )}
                {isBlocked && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-red-600 text-white border-red-700">
                    IP Blocked
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate mt-1">
                Security Incident #{alert.id}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Main Summary Message */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] leading-snug">
              {alert.message || 'Multiple failed admin login attempts detected.'}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="w-1 h-1 rounded-md bg-slate-300 dark:bg-zinc-700" />
              <span className={`font-semibold ${alert.is_read ? 'text-slate-500 dark:text-zinc-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {alert.is_read ? 'Acknowledged (Read)' : 'Unread Incident'}
              </span>
            </div>
          </div>

          {/* Incident Parameters Grid */}
          <div className="rounded-md border border-red-500/30 bg-red-500/5 dark:bg-red-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 text-red-600 dark:text-red-400 font-semibold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                Authentication Attack Parameters
              </span>
              {isBlocked ? (
                <span className="text-[10px] text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-md font-bold">
                  IP BLOCKED BY ADMIN
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                  IP Not Blocked
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-md bg-white/90 dark:bg-zinc-900/90 border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Target Account</p>
                  <p className="font-bold text-slate-900 dark:text-zinc-100 truncate mt-0.5">{alert.email}</p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white/90 dark:bg-zinc-900/90 border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Source IP Address</p>
                  <p className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5 font-mono">{alert.ip_address || '127.0.0.1'}</p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white/90 dark:bg-zinc-900/90 border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Consecutive Failures</p>
                  <p className="font-extrabold text-red-600 dark:text-red-400 mt-0.5 text-sm">{alert.attempts} Failed Attempts</p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white/90 dark:bg-zinc-900/90 border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Defense Status</p>
                  <p className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                    {isBlocked ? 'IP Blacklisted (Access Rejected)' : 'Throttled (Rate Limited)'}
                  </p>
                </div>
              </div>

              {(data.user_agent || alert.user_agent) && (
                <div className="p-3 rounded-md bg-white/90 dark:bg-zinc-900/90 border border-slate-200/70 dark:border-zinc-800 flex items-start gap-3 sm:col-span-2">
                  <Laptop className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Attacker User Agent</p>
                    <p className="font-medium text-slate-700 dark:text-zinc-300 text-xs mt-0.5 break-all">
                      {data.user_agent || alert.user_agent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Defense Explanation */}
          <div className="p-4 rounded-md bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              IP Access Protection
            </h4>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              When an IP is blocked, any client attempting to access or log in from this IP address will be instantly denied with a 403 Forbidden notice.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(alert.id)}
              className="py-2 px-3 rounded-md border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            {/* Block / Unblock IP Button */}
            {isBlocked ? (
              <button
                type="button"
                onClick={() => onUnblockIp(alert.ip_address)}
                className="py-2 px-3.5 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Unblock this IP address"
              >
                <ShieldOff className="w-4 h-4" />
                Unblock IP
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onBlockIp(alert.ip_address)}
                className="py-2 px-3.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Block this IP address immediately"
              >
                <Ban className="w-4 h-4" />
                Block IP
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!alert.is_read && (
              <button
                type="button"
                onClick={() => onMarkRead(alert.id)}
                className="py-2 px-3.5 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4 text-blue-500" />
                Acknowledge
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-md bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
