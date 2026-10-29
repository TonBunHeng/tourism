import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  CalendarCheck, 
  Star, 
  Store, 
  ExternalLink 
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const resolveNotificationLink = (link) => {
  if (typeof link !== 'string' || !link.startsWith('/')) return '/business/notifications';
  if (link.startsWith('/business/bookings/')) return '/business/bookings';
  if (link.startsWith('/bookings/')) return '/bookings';
  return link;
};

export default function BusinessNotifications() {
  const { showSuccess, showError } = useAlert();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = () => {
    setIsLoading(true);
    notificationService.getNotifications()
      .then((res) => {
        if (res?.success) {
          const list = res.data?.notifications || res.data || [];
          setNotifications(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load notifications:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    notificationService.getUnreadCount()
      .then((res) => {
        if (res?.success && typeof res.data?.unread_count === 'number') {
          setUnreadCount(res.data.unread_count);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      showError('Failed to mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res?.success) {
        showSuccess('All notifications marked as read.');
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      showError('Failed to mark all notifications as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await notificationService.deleteNotification(id);
      if (res?.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      showError('Failed to delete notification.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Activity Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Business Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                {unreadCount} unread
              </span>
            )}
          </h1>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck size={15} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner text="Retrieving business alerts..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="You will receive alerts here whenever guests book your services or leave customer reviews."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                n.read
                  ? 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 opacity-80'
                  : 'bg-amber-50/40 dark:bg-zinc-800/90 border-amber-200 dark:border-amber-900 shadow-xs'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${n.read ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500' : 'bg-amber-500 text-white'}`}>
                {n.category === 'Bookings' ? <CalendarCheck size={18} /> : n.category === 'Reviews' ? <Star size={18} /> : <Store size={18} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-2">
                  {n.description || n.message}
                </p>

                <div className="flex items-center justify-between pt-1 text-xs">
                  {n.link ? (
                    <a
                      href={resolveNotificationLink(n.link)}
                      className="text-xs font-semibold text-[#002D62] dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Booking / Item</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : <span />}

                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
