import { useEffect } from 'react';
import {
  X,
  Clock,
  Trash2,
  ExternalLink,
  Check,
  Star,
  CalendarCheck,
  Store,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const resolveNotificationLink = (link) => {
  if (typeof link !== 'string' || !link.startsWith('/')) return '/business/notifications';
  if (link.startsWith('/business/bookings/')) return '/business/bookings';
  if (link.startsWith('/bookings/')) return '/business/bookings';
  return link;
};

export default function NotificationDetailsModal({
  isOpen,
  notification,
  onClose,
  onMarkRead,
  onDelete,
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

  const getCategoryBadge = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'bookings' || cat === 'booking') {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (cat === 'reviews' || cat === 'review') {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    if (cat === 'alerts' || cat === 'security') {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    return 'bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 border-blue-200 dark:border-blue-800';
  };

  const getIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'bookings' || cat === 'booking') return CalendarCheck;
    if (cat === 'reviews' || cat === 'review') return Star;
    if (cat === 'alerts' || cat === 'security') return AlertTriangle;
    return Store;
  };

  const IconComponent = getIcon(notification.category);
  const createdAt = notification.created_at ? new Date(notification.created_at) : null;
  const formattedDate =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recent';

  const actionLink = resolveNotificationLink(notification.link);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-md shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                Notification Details
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadge(
                    notification.category
                  )}`}
                >
                  {notification.category || 'General'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  {!notification.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  )}
                  {!notification.read ? 'Unread' : 'Read'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {notification.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mt-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {notification.description || notification.message || 'No additional details provided.'}
          </div>

          {notification.link && (
            <div className="p-3.5 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 block">
                  Associated Hub Link
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-400 truncate block font-mono">
                  {actionLink}
                </span>
              </div>
              <Link
                to={actionLink}
                onClick={onClose}
                className="px-3 py-1.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40">
          <button
            type="button"
            onClick={() => {
              onDelete(notification.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Alert</span>
          </button>

          <div className="flex items-center gap-2">
            {!notification.read && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

