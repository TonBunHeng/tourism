import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Sparkles,
  Search,
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Tag,
  Clock,
  RefreshCw,
  Inbox,
  CheckCircle2,
  Info
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Notifications() {
  const { showSuccess, showError } = useAlert();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters matching Tour Packages & Support design
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'unread', 'read'
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchNotifications = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await notificationService.getNotifications({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        unread_only: selectedStatus === 'unread' ? true : undefined,
      });

      if (res?.success) {
        const list = res.data?.notifications || res.data?.data || res.data || [];
        setNotifications(Array.isArray(list) ? list : []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Failed to load notifications from database:', err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }

    // Refresh unread count
    try {
      const countRes = await notificationService.getUnreadCount();
      const count = typeof countRes?.data?.unread_count === 'number'
        ? countRes.data.unread_count
        : typeof countRes?.unread_count === 'number'
          ? countRes.unread_count
          : null;
      if (count !== null) {
        setUnreadCount(count);
      }
    } catch {
      // ignore
    }
  }, [search, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
        showSuccess('All notifications have been marked as read in the database.', 'Notifications Updated');
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      showError('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await notificationService.deleteNotification(id);
      if (res?.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showSuccess('Notification deleted.', 'Removed');
      }
    } catch {
      showError('Failed to delete notification.');
    }
  };

  // Local filtering fallback for instantaneous response
  const filteredNotifications = notifications.filter((n) => {
    // Status filter
    if (selectedStatus === 'unread' && n.read) return false;
    if (selectedStatus === 'read' && !n.read) return false;

    // Category filter
    if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(term);
      const matchDesc = (n.description || n.message || '').toLowerCase().includes(term);
      const matchCat = (n.category || '').toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Bookings':
        return <Calendar size={18} className="text-[#002D62] dark:text-blue-400" />;
      case 'Safety':
      case 'Emergency':
        return <AlertTriangle size={18} className="text-rose-500" />;
      case 'Offers':
      case 'Promotions':
        return <Tag size={18} className="text-amber-500" />;
      case 'Events':
        return <Sparkles size={18} className="text-purple-500" />;
      default:
        return <Bell size={18} className="text-[#002D62] dark:text-blue-400" />;
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Live Alerts & Updates
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Travel Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Stay updated with your latest booking statuses, guided tour announcements, and advisories.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-sm transition self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications, alerts, or bookings..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="all">All Statuses ({notifications.length})</option>
              <option value="unread">Unread Only ({unreadCount})</option>
              <option value="read">Read Notifications ({Math.max(0, notifications.length - unreadCount)})</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">All Categories</option>
              <option value="Bookings">Tour & Travel Bookings</option>
              <option value="Safety">Safety & Emergency</option>
              <option value="Events">Events & Festivals</option>
              <option value="Offers">Promotions & Offers</option>
              <option value="System">System Announcements</option>
              <option value="General">General Inquiries</option>
            </select>
          </div>
        </div>

        {/* Bottom Status & Quick Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div>
              Total Notifications in Database: <strong className="text-slate-800 dark:text-zinc-200">{filteredNotifications.length}</strong>
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition p-1"
              title="Refresh notifications from database"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#002D62]' : ''} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 font-semibold text-[#002D62] dark:text-blue-400 hover:underline cursor-pointer"
              >
                <CheckCheck size={14} />
                <span>Mark All as Read</span>
              </button>
            )}

            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck size={14} />
              <span>Ministry Verified Alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List Content */}
      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner text="Retrieving live notifications from database..." />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-12 text-center shadow-xs">
          <EmptyState
            icon={Inbox}
            title="No Notifications Found"
            description={
              search || selectedCategory !== 'All' || selectedStatus !== 'all'
                ? "No notifications match your current filter criteria. Try resetting your search or filter options."
                : "You are completely caught up! We will alert you here as soon as tour bookings, guide confirmations, or travel advisories occur."
            }
          />
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNotifications.map((n) => {
            const isUnread = !n.read;
            return (
              <div
                key={n.id}
                className={`group rounded-2xl border transition-all duration-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnread
                    ? 'bg-blue-50/50 dark:bg-zinc-800/90 border-blue-200 dark:border-blue-900/60 shadow-xs ring-1 ring-blue-500/15'
                    : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Left: Icon & Notification Info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    isUnread 
                      ? 'bg-blue-100 dark:bg-blue-950/80 ring-2 ring-blue-500/30' 
                      : 'bg-slate-100 dark:bg-zinc-800'
                  }`}>
                    {getCategoryIcon(n.category)}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold tracking-wide uppercase">
                        {n.category || 'General'}
                      </span>

                      {isUnread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold tracking-wider uppercase animate-pulse">
                          <span>New</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={12} />
                        <span>{formatTimestamp(n.created_at)}</span>
                      </span>
                    </div>

                    <h3 className={`text-sm sm:text-base font-extrabold leading-snug ${
                      isUnread 
                        ? 'text-[#002D62] dark:text-blue-300' 
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {n.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                      {n.description || n.message}
                    </p>

                    {n.link && (
                      <div className="pt-1">
                        <Link
                          to={n.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002D62] dark:text-blue-400 hover:underline"
                        >
                          <span>View Details & Item</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.id)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>Mark as Read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
