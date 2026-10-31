import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Eye,
  Star,
  Clock,
  ChevronDown,
  CalendarCheck,
  Store,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import NotificationDetailsModal from './NotificationDetailsModal';

const NOTIFICATION_CATEGORIES = ['All', 'Bookings', 'Reviews', 'System', 'Alerts'];

export default function BusinessNotifications() {
  const { showSuccess, showError, showConfirm } = useAlert();
  const { searchTerm } = useSearch();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Notification for Details Modal
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchNotifications = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await notificationService.getNotifications();
      if (res?.success) {
        const list = res.data?.notifications || res.data || [];
        setNotifications(Array.isArray(list) ? list : []);
      }

      const unreadRes = await notificationService.getUnreadCount();
      if (unreadRes?.success && typeof unreadRes.data?.unread_count === 'number') {
        setUnreadCount(unreadRes.data.unread_count);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleSync = () => fetchNotifications(false);
    window.addEventListener('notifications-updated', handleSync);
    return () => window.removeEventListener('notifications-updated', handleSync);
  }, []);

  const handleOpenDetails = (notification, e) => {
    if (e) e.stopPropagation();
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);

    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await notificationService.markAsRead(id);
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        if (selectedNotification && selectedNotification.id === id) {
          setSelectedNotification((prev) => ({ ...prev, read: true }));
        }
        window.dispatchEvent(new CustomEvent('notifications-updated'));
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
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      }
    } catch {
      showError('Failed to mark all notifications as read.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    const confirmed = await showConfirm({
      title: 'Delete Notification',
      message: 'Remove this notification alert permanently?',
      confirmText: 'Delete',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await notificationService.deleteNotification(id);
      if (res?.success) {
        showSuccess('Notification deleted.');
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      }
    } catch {
      showError('Failed to delete notification.');
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '—';
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffSec = Math.floor((now - date) / 1000);
      if (Number.isNaN(date.getTime())) return '—';
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'bookings' || cat === 'booking') {
      return {
        icon: CalendarCheck,
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
      };
    }
    if (cat === 'reviews' || cat === 'review') {
      return {
        icon: Star,
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
      };
    }
    if (cat === 'alerts' || cat === 'security') {
      return {
        icon: AlertTriangle,
        bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
      };
    }
    return {
      icon: Store,
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
    };
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category filter
      if (filterCategory !== 'All') {
        const cat = (n.category || '').toLowerCase();
        if (cat !== filterCategory.toLowerCase()) return false;
      }
      // Status filter
      if (statusFilter === 'unread' && n.read) return false;
      if (statusFilter === 'read' && !n.read) return false;

      // Global search filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(q);
        const matchesDesc = (n.description || n.message)?.toLowerCase().includes(q);
        const matchesCat = n.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [notifications, filterCategory, statusFilter, searchTerm]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, statusFilter, searchTerm]);

  // Paginated notifications
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedNotifications = filteredNotifications.slice(startIndex, endIndex);

  // KPI Stats
  const statsList = useMemo(() => {
    const total = notifications.length;
    const bookingCount = notifications.filter((n) =>
      (n.category || '').toLowerCase().includes('booking')
    ).length;
    const reviewCount = notifications.filter((n) =>
      (n.category || '').toLowerCase().includes('review')
    ).length;

    return [
      {
        title: 'Total Alerts',
        value: total.toLocaleString(),
        subtext: 'System notifications',
        icon: Bell,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
      },
      {
        title: 'Unread Alerts',
        value: unreadCount.toLocaleString(),
        subtext: unreadCount === 0 ? 'All caught up' : 'Pending review',
        icon: AlertTriangle,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
      },
      {
        title: 'Booking Requests',
        value: bookingCount.toLocaleString(),
        subtext: 'Reservation activity',
        icon: CalendarCheck,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      },
      {
        title: 'Customer Reviews',
        value: reviewCount.toLocaleString(),
        subtext: 'Guest feedback',
        icon: Star,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
      },
    ];
  }, [notifications, unreadCount]);

  return (
    <div className="flex flex-col">
      {/* Notification Details Modal */}
      <NotificationDetailsModal
        isOpen={isDetailsModalOpen}
        notification={selectedNotification}
        onClose={() => setIsDetailsModalOpen(false)}
        onMarkRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {/* Header Section (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Notifications Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Live updates on customer reservation bookings, reviews, and system announcements.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap self-start sm:self-auto">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="py-2 px-3.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCheck className="w-4 h-4 text-white" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fetchNotifications(false)}
              disabled={isRefreshing}
              className="py-2 px-3.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700/60 text-xs font-medium text-gray-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-md p-4 shadow-xs border border-gray-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 tracking-tight truncate">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center ${stat.bg}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2 truncate">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-md shadow-xs border border-gray-200 dark:border-zinc-800">
        {/* Table/List Filter Bar */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Recent Alerts
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                {filteredNotifications.length} {filteredNotifications.length === 1 ? 'Alert' : 'Alerts'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Category Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003E83] bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs sm:text-sm cursor-pointer shadow-xs font-medium"
                >
                  {NOTIFICATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003E83] bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs sm:text-sm cursor-pointer shadow-xs font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Content View */}
        {isLoading ? (
          <div className="p-16 text-center">
            <LoadingSpinner text="Retrieving business alerts..." />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={Bell}
              title="No notifications found"
              description={
                searchTerm || filterCategory !== 'All' || statusFilter !== 'all'
                  ? 'No alerts match your current filter parameters. Try clearing the filters.'
                  : 'You will receive alerts here whenever guests book your services or leave customer reviews.'
              }
            />
          </div>
        ) : (
          <>
            {/* Mobile View (< sm) */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-zinc-800">
              {displayedNotifications.map((n) => {
                const { icon: Icon, bg: iconBg } = getNotificationIcon(n.category);
                const timeLabel = formatTimeAgo(n.created_at);

                return (
                  <div
                    key={n.id}
                    onClick={(e) => handleOpenDetails(n, e)}
                    className={`p-4 hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                      !n.read ? 'bg-blue-50/25 dark:bg-blue-950/15' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700">
                            {n.category || 'General'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border shrink-0 ${
                              !n.read
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                            }`}
                          >
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                            )}
                            {!n.read ? 'Unread' : 'Read'}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">
                          {n.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {n.description || n.message}
                        </p>

                        <div
                          className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[11px] text-gray-400 dark:text-zinc-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {timeLabel}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenDetails(n, e)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {!n.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-all cursor-pointer"
                                title="Mark read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDelete(n.id, e)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Responsive Table View (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left divide-y divide-gray-200 dark:divide-zinc-800 table-auto">
                <thead className="bg-gray-50/70 dark:bg-zinc-800/50">
                  <tr>
                    <th className="pl-4 pr-2 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider w-10 text-center font-mono">
                      #
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      Notification / Event
                    </th>
                    <th className="px-3 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap w-32">
                      Category
                    </th>
                    <th className="px-3 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap w-36">
                      Timestamp
                    </th>
                    <th className="px-3 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap w-28">
                      Status
                    </th>
                    <th className="pl-3 pr-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider w-24 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-100 dark:divide-zinc-800">
                  {displayedNotifications.map((n, index) => {
                    const { icon: Icon, bg: iconBg } = getNotificationIcon(n.category);
                    const timeLabel = formatTimeAgo(n.created_at);

                    return (
                      <tr
                        key={n.id}
                        onClick={(e) => handleOpenDetails(n, e)}
                        className={`hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer ${
                          !n.read ? 'bg-blue-50/25 dark:bg-blue-950/15' : ''
                        }`}
                      >
                        <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-gray-400 dark:text-zinc-500 font-mono text-center">
                          {startIndex + index + 1}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${iconBg}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate max-w-md">
                                {n.description || n.message}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700">
                            {n.category || 'General'}
                          </span>
                        </td>

                        <td className="px-3 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-zinc-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                            <span>{timeLabel}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                              !n.read
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                            }`}
                          >
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                            )}
                            {!n.read ? 'Unread' : 'Read'}
                          </span>
                        </td>

                        <td
                          className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenDetails(n, e)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-95 cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!n.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-all active:scale-95 cursor-pointer"
                                title="Mark read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDelete(n.id, e)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-all active:scale-95 cursor-pointer"
                              title="Delete alert"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 md:px-6 py-3.5 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(endIndex, filteredNotifications.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {filteredNotifications.length}
                  </span>{' '}
                  alerts
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 px-2 font-mono">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
