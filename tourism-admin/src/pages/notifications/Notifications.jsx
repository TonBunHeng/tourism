import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Eye,
  Star,
  UserX,
  MessageCircle,
  ShieldAlert,
  Clock,
  ChevronDown,
  Info,
  Users,
  Loader2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { useLanguage } from '../../i18n';
import notificationService from '../../services/notificationService';
import NotificationDetailsModal from './NotificationDetailsModal';
import SimplePagination from '../../components/common/SimplePagination';
import { getPageCache, setPageCache } from '../../utils/pageCache';

export default function Notifications() {
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab persistence via URL search param + sessionStorage
  const [filterCategory, setFilterCategory] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl.toLowerCase() !== 'security') return tabFromUrl;
    const tabFromStorage = sessionStorage.getItem('notifications_active_tab');
    if (tabFromStorage && tabFromStorage.toLowerCase() !== 'security') return tabFromStorage;
    return 'All';
  });

  const [notifications, setNotifications] = useState(() => getPageCache('notifications_data')?.notifications || []);
  const [unreadCount, setUnreadCount] = useState(() => getPageCache('notifications_data')?.unreadCount || 0);
  const [loading, setLoading] = useState(() => !getPageCache('notifications_data'));
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination States (10 items per page standard)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Notification for Details Modal
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const categories = ['All', 'Alerts', 'Reviews', 'Messages', 'Users', 'System'];

  const getCategoryLabel = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'all': return t('notifications.catAll');
      case 'alerts': return t('notifications.catAlerts');
      case 'reviews': return t('notifications.catReviews');
      case 'messages': return t('notifications.catMessages');
      case 'users': return t('notifications.catUsers');
      case 'system': return t('notifications.catSystem');
      default: return cat || t('notifications.catGeneral');
    }
  };

  // Sync tab state to URL & Storage
  const handleCategoryChange = (cat) => {
    setFilterCategory(cat);
    setCurrentPage(1);
    sessionStorage.setItem('notifications_active_tab', cat);
    if (cat === 'All') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: cat }, { replace: true });
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return t('notifications.timeRecent');
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return t('notifications.timeJustNow');
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return diffMin === 1
          ? t('notifications.timeMinsAgo', { count: diffMin })
          : t('notifications.timeMinsAgoPlural', { count: diffMin });
      }
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) {
        return diffHour === 1
          ? t('notifications.timeHoursAgo', { count: diffHour })
          : t('notifications.timeHoursAgoPlural', { count: diffHour });
      }
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays === 1) return t('notifications.timeYesterday');
      if (diffDays < 7) return t('notifications.timeDaysAgo', { count: diffDays });
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type, category) => {
    const cat = (category || '').toLowerCase();
    const typ = (type || '').toLowerCase();

    if (cat === 'security' || typ === 'security') {
      return {
        icon: ShieldAlert,
        iconBg: 'bg-red-50 dark:bg-red-950/40',
        iconColor: 'text-red-600 dark:text-red-400'
      };
    }
    if (typ === 'deletion_request' || cat === 'alerts') {
      return {
        icon: UserX,
        iconBg: 'bg-rose-50 dark:bg-rose-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400'
      };
    }
    if (typ === 'review' || cat === 'reviews') {
      return {
        icon: Star,
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    }
    if (typ === 'chat' || cat === 'messages') {
      return {
        icon: MessageCircle,
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    }
    if (typ === 'user' || cat === 'users') {
      return {
        icon: Users,
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
        iconColor: 'text-indigo-600 dark:text-indigo-400'
      };
    }
    if (typ === 'event') {
      return {
        icon: Calendar,
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    }
    return {
      icon: Info,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400'
    };
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const params = {};
      if (filterCategory !== 'All') {
        params.category = filterCategory;
      }
      if (statusFilter === 'unread') {
        params.unread_only = true;
      }

      const res = await notificationService.getNotifications(params);
      const data = res?.data || res || [];
      const notifs = Array.isArray(data) ? data : (data.data || []);
      setNotifications(notifs);

      // Meta counts
      let unread = 0;
      if (res?.meta?.unread_count !== undefined) {
        unread = res.meta.unread_count;
        setUnreadCount(unread);
      } else {
        const unreadRes = await notificationService.getUnreadCount();
        unread = unreadRes?.unread_count || 0;
        setUnreadCount(unread);
      }

      if (filterCategory === 'All' && statusFilter === 'all') {
        setPageCache('notifications_data', { notifications: notifs, unreadCount: unread });
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, statusFilter]);

  useEffect(() => {
    fetchNotifications();

    const handleSync = () => fetchNotifications(true);
    window.addEventListener('notifications-updated', handleSync);
    return () => window.removeEventListener('notifications-updated', handleSync);
  }, [fetchNotifications]);

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
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(prev => ({ ...prev, read: true }));
      }
      setUnreadCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const confirmed = await showConfirm({
      title: t('notifications.markAllConfirmTitle'),
      message: t('notifications.markAllConfirmMsg'),
      confirmText: t('notifications.markAllConfirmBtn'),
      type: 'warning'
    });

    if (confirmed) {
      try {
        await notificationService.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        showError(err.message || 'Failed to mark all as read.', 'Error');
      }
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    const confirmed = await showConfirm({
      title: t('notifications.deleteConfirmTitle'),
      message: t('notifications.deleteConfirmMsg'),
      confirmText: t('notifications.deleteConfirmBtn'),
      type: 'danger'
    });

    if (confirmed) {
      try {
        await notificationService.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (selectedNotification && selectedNotification.id === id) {
          setIsDetailsModalOpen(false);
          setSelectedNotification(null);
        }
        showSuccess(t('notifications.deleteSuccess'), t('common.success') || 'Success');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        showError(err.message || 'Failed to delete notification.', 'Error');
      }
    }
  };

  const handleClearAll = async () => {
    const confirmed = await showConfirm({
      title: t('notifications.clearAllConfirmTitle'),
      message: t('notifications.clearAllConfirmMsg'),
      confirmText: t('notifications.clearAllConfirmBtn'),
      type: 'danger'
    });

    if (confirmed) {
      try {
        await notificationService.clearAll();
        setNotifications([]);
        setUnreadCount(0);
        showSuccess(t('notifications.clearAllSuccess'), t('common.success') || 'Success');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        showError(err.message || 'Failed to clear notifications.', 'Error');
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (statusFilter === 'unread') {
      list = list.filter(n => !n.read);
    } else if (statusFilter === 'read') {
      list = list.filter(n => n.read);
    }
    if (filterCategory !== 'All') {
      list = list.filter(n => (n.category || '').toLowerCase() === filterCategory.toLowerCase());
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.description || n.message || '').toLowerCase().includes(q) ||
        (n.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, statusFilter, filterCategory, searchTerm]);

  const totalRecords = filteredNotifications.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const displayedNotifications = filteredNotifications.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, statusFilter]);

  const statsList = [
    {
      label: t('notifications.statTotal'),
      value: notifications.length.toLocaleString(),
      subtext: t('notifications.subtextTotal'),
      icon: Bell,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: t('notifications.statUnread'),
      value: unreadCount.toLocaleString(),
      subtext: unreadCount === 0 ? t('notifications.subtextUnreadAllRead') : t('notifications.subtextUnreadCount', { count: unreadCount }),
      icon: AlertTriangle,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: t('notifications.statReviews'),
      value: notifications.filter(n => (n.category || '').toLowerCase() === 'reviews' || (n.type || '').toLowerCase() === 'review').length.toLocaleString(),
      subtext: t('notifications.subtextReviews'),
      icon: Star,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      label: t('notifications.statSecurity'),
      value: notifications.filter(n => ['security', 'alerts', 'system'].includes((n.category || '').toLowerCase()) || (n.type || '').toLowerCase() === 'security').length.toLocaleString(),
      subtext: t('notifications.subtextSecurity'),
      icon: ShieldAlert,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Notification Details Modal */}
      <NotificationDetailsModal
        isOpen={isDetailsModalOpen}
        notification={selectedNotification}
        onClose={() => setIsDetailsModalOpen(false)}
        onMarkRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />

      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              {t('notifications.title', 'Notifications')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              {t('notifications.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="py-2 px-3.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCheck className="w-4 h-4 text-white" />
                <span>{t('notifications.markAllRead')}</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="py-2 px-3.5 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('notifications.clearAll')}</span>
              </button>
            )}
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

      {/* Main Container with Places-Standard Toolbar & Table */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-sm overflow-hidden flex flex-col flex-1">
        {/* Toolbar Header (Places Benchmark Pattern) */}
        <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('notifications.sectionTitle')}
              </h2>
              {totalRecords !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  {totalRecords === 1
                    ? t('notifications.pillCountSingle')
                    : t('notifications.pillCount', { count: totalRecords })}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Category Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? t('notifications.allCategories') : getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  <option value="all">{t('notifications.allStatus')}</option>
                  <option value="unread">{t('notifications.unreadOnly', { count: unreadCount })}</option>
                  <option value="read">{t('notifications.readStatus')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-500 animate-spin" />
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('notifications.loadingNotifs')}
            </p>
          </div>
        ) : displayedNotifications.length > 0 ? (
          <>
            {/* Mobile Card List View (< sm) */}
            <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
              {displayedNotifications.map((notification) => {
                const { icon: Icon, iconBg, iconColor } = getNotificationIcon(
                  notification.type,
                  notification.category
                );
                const timeLabel = formatTimeAgo(notification.created_at);

                return (
                  <div
                    key={notification.id}
                    onClick={(e) => handleOpenDetails(notification, e)}
                    className={`p-4 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 ${iconBg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            {getCategoryLabel(notification.category)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${
                            !notification.read
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                          }`}>
                            {!notification.read && <span className="w-1.5 h-1.5 rounded-md bg-blue-600 animate-pulse shrink-0" />}
                            {!notification.read ? t('notifications.badgeUnread') : t('notifications.badgeRead')}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">
                          {notification.title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5 leading-relaxed line-clamp-2">
                          {notification.description}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {timeLabel}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenDetails(notification, e)}
                              className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                              title={t('notifications.tooltipViewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!notification.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                title={t('notifications.tooltipMarkRead')}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                              title={t('notifications.tooltipDelete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Responsive Table View (>= sm, Places Pattern) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-auto">
                <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
                  <tr>
                    <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center font-mono">
                      {t('notifications.thIndex')}
                    </th>
                    <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                      {t('notifications.thNotificationEvent')}
                    </th>
                    <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
                      {t('notifications.thCategory')}
                    </th>
                    <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-36">
                      {t('notifications.thTime')}
                    </th>
                    <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                      {t('notifications.thStatus')}
                    </th>
                    <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-24 whitespace-nowrap">
                      {t('notifications.thActions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
                  {displayedNotifications.map((notification, index) => {
                    const { icon: Icon, iconBg, iconColor } = getNotificationIcon(
                      notification.type,
                      notification.category
                    );
                    const timeLabel = formatTimeAgo(notification.created_at);

                    return (
                      <tr
                        key={notification.id}
                        onClick={(e) => handleOpenDetails(notification, e)}
                        className={`hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group cursor-pointer ${
                          !notification.read ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                        }`}
                      >
                        <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                          {startIndex + index + 1}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 ${iconBg}`}>
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                                {notification.title}
                              </p>
                              <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate max-w-md">
                                {notification.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700">
                            {getCategoryLabel(notification.category)}
                          </span>
                        </td>

                        <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted-light)] shrink-0" />
                            <span>{timeLabel}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                            !notification.read
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                          }`}>
                            {!notification.read && <span className="w-1.5 h-1.5 rounded-md bg-blue-600 animate-pulse shrink-0" />}
                            {!notification.read ? t('notifications.badgeUnread') : t('notifications.badgeRead')}
                          </span>
                        </td>

                        <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenDetails(notification, e)}
                              className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                              title={t('notifications.tooltipViewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!notification.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                title={t('notifications.tooltipMarkRead')}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                              title={t('notifications.tooltipDelete')}
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
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              {t('notifications.noNotificationsFound', { category: filterCategory !== 'All' ? getCategoryLabel(filterCategory) : '' })}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              {t('notifications.allCaughtUp')}
            </p>
          </div>
        )}

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label={t('notifications.paginationLabel')}
        />
      </div>
    </div>
  );
}
