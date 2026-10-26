import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Star,
  UserX,
  MessageCircle,
  ShieldAlert,
  Calendar,
  RefreshCw,
  Loader2,
  Clock,
  ChevronRight,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import notificationService from '../../services/notificationService';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

export default function Notifications() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showConfirm, showSuccess, showError } = useAlert();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(notifications.length / itemsPerPage) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, notifications.length);
  const paginatedNotifications = notifications.slice(startIndex, endIndex);

  const categories = ['All', 'Alerts', 'Reviews', 'Messages', 'Events', 'System'];

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
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type, category) => {
    const cat = category || '';
    const typ = type || '';

    if (typ === 'deletion_request' || cat === 'Alerts') {
      return {
        icon: UserX,
        iconBg: 'bg-rose-50 dark:bg-rose-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400'
      };
    }
    if (typ === 'review' || cat === 'Reviews') {
      return {
        icon: Star,
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    }
    if (typ === 'chat' || cat === 'Messages') {
      return {
        icon: MessageCircle,
        iconBg: 'bg-teal-50 dark:bg-teal-950/40',
        iconColor: 'text-teal-600 dark:text-teal-400'
      };
    }
    if (typ === 'event' || cat === 'Events') {
      return {
        icon: Calendar,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
      };
    }
    return {
      icon: ShieldAlert,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-[#003E83] dark:text-[#60a5fa]'
    };
  };

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {};
      if (filterCategory !== 'All') {
        params.category = filterCategory;
      }
      if (showUnreadOnly) {
        params.unread_only = true;
      }

      const res = await notificationService.getNotifications(params);
      const data = res?.data || res || [];
      const notifs = Array.isArray(data) ? data : (data.data || []);
      setNotifications(notifs);

      if (res?.meta?.unread_count !== undefined) {
        setUnreadCount(res.meta.unread_count);
      } else {
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch travel notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, filterCategory, showUnreadOnly]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showSuccess('All notifications marked as read.', 'Notifications Updated');
      window.dispatchEvent(new CustomEvent('travel-notifications-updated'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      showError('Failed to mark notifications as read.');
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e?.target?.closest('a') || e?.target?.closest('button')) return;

    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('travel-notifications-updated'));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => {
        const item = notifications.find(n => n.id === id);
        return item && !item.read ? Math.max(0, prev - 1) : prev;
      });
      showSuccess('Notification removed.', 'Removed');
      window.dispatchEvent(new CustomEvent('travel-notifications-updated'));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      showError('Failed to delete notification.');
    }
  };

  const handleClearAll = async () => {
    const confirmed = await showConfirm({
      title: 'Clear Notifications',
      message: 'Are you sure you want to clear all notifications? This action cannot be undone.',
      confirmText: 'Clear All',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await notificationService.clearAll();
        setNotifications([]);
        setUnreadCount(0);
        showSuccess('All notifications have been cleared.', 'Notifications Cleared');
        window.dispatchEvent(new CustomEvent('travel-notifications-updated'));
      } catch (err) {
        console.error('Failed to clear notifications:', err);
        showError('Failed to clear notifications.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-[#60a5fa] flex items-center justify-center mx-auto">
          <Bell className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications Center</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Sign in to view your travel alerts, booking updates, support replies, and community activity.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          Sign In to View Notifications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Notifications' }]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Activity & Communication Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Stay updated with your travel wishlist, support chats, review approvals, and Angkor festival events
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing || loading}
            className="py-2 px-3.5 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-bold text-gray-700 dark:text-zinc-200 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="py-2 px-3.5 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="py-2 px-3.5 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setFilterCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#003E83] text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => {
                setShowUnreadOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded border-gray-300 text-[#003E83] focus:ring-[#003E83] w-3.5 h-3.5 cursor-pointer"
            />
            Show unread only ({unreadCount})
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Loading your travel notifications...
            </p>
          </div>
        ) : paginatedNotifications.length > 0 ? (
          paginatedNotifications.map((notification) => {
            const { icon: Icon, iconBg, iconColor } = getNotificationIcon(
              notification.type,
              notification.category
            );
            const timeLabel = formatTimeAgo(notification.created_at);

            return (
              <div
                key={notification.id}
                onClick={(e) => handleMarkAsRead(notification.id, e)}
                className={`p-4 md:p-5 flex items-start justify-between gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/60 cursor-pointer ${
                  !notification.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-lg shrink-0 ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {notification.category || 'General'}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                      )}
                      <span className="text-[11px] text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeLabel}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {notification.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {notification.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {notification.link && (
                    <Link
                      to={notification.link}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#003E83] dark:hover:text-[#60a5fa] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Open details"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              No notifications found
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              You are all caught up with recent Angkor travel updates!
            </p>
          </div>
        )}

        {/* Standard Pagination */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={notifications.length}
          label="notifications"
        />
      </div>
    </div>
  );
}
