import { useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Clock,
  Mail,
  Globe,
  AlertOctagon,
  CheckCircle,
  Trash2,
  ExternalLink,
  Laptop,
  Check,
  Star,
  UserX,
  MessageCircle,
  Users,
  Calendar,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationDetailsModal({
  isOpen,
  notification,
  onClose,
  onMarkRead,
  onDelete
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

  if (!isOpen || !notification) return null;

  const getCategoryBadgeColor = (category, type) => {
    const cat = (category || '').toLowerCase();
    const typ = (type || '').toLowerCase();

    if (cat === 'security' || typ === 'security' || typ === 'alert') {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    }
    if (cat === 'alerts' || typ === 'deletion_request') {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
    if (cat === 'reviews' || typ === 'review') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    if (cat === 'messages' || typ === 'chat') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    if (cat === 'users' || typ === 'user') {
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  };

  const getIcon = (category, type) => {
    const cat = (category || '').toLowerCase();
    const typ = (type || '').toLowerCase();

    if (cat === 'security' || typ === 'security') return ShieldAlert;
    if (cat === 'alerts' || typ === 'deletion_request') return UserX;
    if (cat === 'reviews' || typ === 'review') return Star;
    if (cat === 'messages' || typ === 'chat') return MessageCircle;
    if (cat === 'users' || typ === 'user') return Users;
    if (typ === 'event') return Calendar;
    return Info;
  };

  const IconComponent = getIcon(notification.category, notification.type);
  const data = typeof notification.data === 'string'
    ? (() => { try { return JSON.parse(notification.data); } catch { return {}; } })()
    : (notification.data || {});

  const isSecurity = (notification.category || '').toLowerCase() === 'security' ||
                     (notification.type || '').toLowerCase() === 'security' ||
                     (notification.title || '').toLowerCase().includes('security');

  const formattedDate = notification.created_at
    ? new Date(notification.created_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Recent';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark-modal)] border border-gray-200 dark:border-zinc-800 rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-alert-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-md border ${getCategoryBadgeColor(notification.category, notification.type)} shrink-0`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeColor(notification.category, notification.type)} mb-1`}>
                {notification.category || 'General'}
              </span>
              <h2 className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                Notification Details
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-md transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Title & Time */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] leading-snug">
              {notification.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="w-1 h-1 rounded-md bg-slate-300 dark:bg-zinc-700" />
              <span className={`font-semibold ${notification.read ? 'text-slate-500 dark:text-zinc-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {notification.read ? 'Read' : 'Unread'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-md bg-slate-100/70 dark:bg-zinc-800/60 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-slate-700 dark:text-zinc-300 leading-relaxed text-sm">
            {notification.description || 'No additional description provided.'}
          </div>

          {/* Security Alert Payload Card */}
          {isSecurity && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 dark:bg-red-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-xs uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4" />
                Security Incident Parameters
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.email && (
                  <div className="p-2.5 rounded-md bg-white/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">Target Account</p>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{data.email}</p>
                    </div>
                  </div>
                )}

                {data.ip_address && (
                  <div className="p-2.5 rounded-md bg-white/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">Source IP</p>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">{data.ip_address}</p>
                    </div>
                  </div>
                )}

                {data.attempts && (
                  <div className="p-2.5 rounded-md bg-white/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">Failed Attempts</p>
                      <p className="font-bold text-red-600 dark:text-red-400">{data.attempts} Failed Tries</p>
                    </div>
                  </div>
                )}

                {data.user_agent && (
                  <div className="p-2.5 rounded-md bg-white/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 flex items-center gap-2.5 sm:col-span-2">
                    <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">Client User Agent</p>
                      <p className="font-medium text-slate-700 dark:text-zinc-300 text-[11px] truncate">{data.user_agent}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* General Attached Data */}
          {!isSecurity && Object.keys(data).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Event Data
              </h4>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                {Object.entries(data).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDelete(notification.id)}
            className="py-2 px-3.5 rounded-md border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex items-center gap-2">
            {!notification.read && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="py-2 px-3.5 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-blue-600" />
                Mark as Read
              </button>
            )}

            {notification.link && notification.link !== '/notifications' && !notification.link.startsWith('/notifications?') && (
              <Link
                to={notification.link}
                onClick={onClose}
                className="py-2 px-3.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Go to Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 rounded-md bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
