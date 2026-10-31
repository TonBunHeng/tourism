import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Store,
  Loader2,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { getInitialTheme, isDarkTheme, toggleTheme, THEME_CHANGE_EVENT } from '../../utils/Theme';
import BusinessLogoutAlert from './BusinessLogoutAlert';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export default function BusinessHeader({
  toggleSidebar,
  isSidebarOpen,
  isExpanded,
  toggleExpand,
  selectedBusiness,
  businesses = [],
  onSelectBusiness,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => isDarkTheme(getInitialTheme()));

  const businessDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '—';
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffSec = Math.floor((now - date) / 1000);
      if (Number.isNaN(date.getTime())) return '—';
      if (diffSec < 0) return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

  const fetchHeaderNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications({ limit: 6 });
      const data = res?.data || res || [];
      const notifs = Array.isArray(data) ? data : data.data || [];
      setNotifications(notifs);

      const unreadMeta = res?.meta?.unread_count ?? res?.data?.meta?.unread_count;
      if (unreadMeta !== undefined) {
        setUnreadCount(Number(unreadMeta) || 0);
      } else {
        const unreadRes = await notificationService.getUnreadCount();
        const unread = unreadRes?.unread_count ?? unreadRes?.data?.unread_count;
        setUnreadCount(unread !== undefined ? Number(unread) || 0 : notifs.filter((n) => !n.read).length);
      }
    } catch {
      // Graceful silence on network error
    }
  }, []);

  useEffect(() => {
    fetchHeaderNotifications();
    const handleUpdate = () => fetchHeaderNotifications();
    window.addEventListener('notifications-updated', handleUpdate);
    const interval = setInterval(fetchHeaderNotifications, 45000);

    return () => {
      window.removeEventListener('notifications-updated', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchHeaderNotifications]);

  // Theme Sync
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e?.detail?.theme) {
        setIsDarkMode(isDarkTheme(e.detail.theme));
      } else {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme(isDarkMode ? 'dark' : 'light');
    setIsDarkMode(isDarkTheme(next));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target)) {
        setShowBusinessDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (toggleSidebar) toggleSidebar();
    } else {
      if (toggleExpand) toggleExpand();
    }
  };

  const handleMarkAllRead = async (e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowProfileMenu(false);
    setShowBusinessDropdown(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
    setShowNotifications(false);
    setShowBusinessDropdown(false);
  };

  const userName = user?.name || 'Business Owner';
  const userEmail = user?.email || 'owner@angkorverses.com';
  const userAvatar = user?.avatar || null;

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-30 transition-colors duration-200 w-full flex items-center shrink-0">
      <div className="px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          {/* Left section - Sidebar Toggle + Active Business Widget (Moved from Sidebar) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2 sm:mr-4">
            <button
              type="button"
              onClick={handleSidebarToggle}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 text-gray-600 dark:text-zinc-300 transition-all duration-150 shrink-0 cursor-pointer flex items-center justify-center h-10 w-10"
              title={isSidebarOpen ? 'Close Sidebar' : isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
              aria-label="Toggle Sidebar Navigation"
            >
              <span className="md:hidden">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </span>
              <span className="hidden md:inline-flex">
                <Menu size={20} />
              </span>
            </button>

            {/* Active Business Switcher Widget */}
            <div ref={businessDropdownRef} className="relative">
              {selectedBusiness ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBusinessDropdown((prev) => !prev);
                      setShowNotifications(false);
                      setShowProfileMenu(false);
                    }}
                    className="h-10 px-3 py-1 rounded-md bg-white hover:bg-gray-50 dark:bg-zinc-800/90 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 transition-all cursor-pointer text-left shadow-2xs group flex flex-col justify-center min-w-[200px] max-w-[240px] sm:max-w-xs md:max-w-sm"
                  >
                    {/* Row 1: Label + Category + Verification Badge */}
                    <div className="flex items-center justify-between gap-2 leading-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 shrink-0">
                          ACTIVE BUSINESS
                        </span>
                        {selectedBusiness.category?.name && (
                          <span className="text-[9px] font-medium text-gray-500 dark:text-zinc-400 truncate hidden sm:inline">
                            • {selectedBusiness.category.name}
                          </span>
                        )}
                      </div>
                      {selectedBusiness.verification_status === 'approved' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Row 2: Business Name + Chevron */}
                    <div className="flex items-center justify-between gap-1.5 mt-0.5 leading-none">
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                        {selectedBusiness.name}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 shrink-0 transition-transform duration-150 group-hover:text-gray-600 dark:group-hover:text-zinc-200 ${
                          showBusinessDropdown ? 'rotate-180 text-[#003E83] dark:text-blue-400' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Business Switcher Dropdown */}
                  {showBusinessDropdown && (
                    <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-xl py-1.5 z-50 animate-dropdown max-h-72 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800 mb-1 flex items-center justify-between">
                        <span>Switch Business Profile</span>
                        <span className="text-[10px] font-semibold text-gray-400">
                          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
                        </span>
                      </div>
                      {businesses.length === 0 ? (
                        <div className="px-3 py-3 text-xs text-gray-400 text-center">No other businesses registered.</div>
                      ) : (
                        businesses.map((biz) => (
                          <button
                            key={biz.id}
                            type="button"
                            onClick={() => {
                              onSelectBusiness?.(biz);
                              setShowBusinessDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs truncate transition flex items-center justify-between cursor-pointer ${
                              biz.id === selectedBusiness.id
                                ? 'bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 font-semibold'
                                : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold truncate text-xs">{biz.name}</div>
                              <div className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                                {biz.category?.name || biz.province?.name || 'Hospitality Partner'}
                              </div>
                            </div>
                            {biz.id === selectedBusiness.id && (
                              <CheckCircle2 size={14} className="text-[#003E83] dark:text-blue-400 shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                      <div className="border-t border-gray-100 dark:border-zinc-800 pt-1.5 mt-1 px-2">
                        <Link
                          to="/business/profile"
                          onClick={() => setShowBusinessDropdown(false)}
                          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md text-xs font-semibold text-[#003E83] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                        >
                          <span>+ Manage / Add Profile</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/business/profile"
                  className="h-10 px-3 rounded-md border border-dashed border-gray-300 dark:border-zinc-700 text-xs font-semibold text-[#003E83] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"
                >
                  <span>+ Register Business Profile</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 text-gray-600 dark:text-zinc-300 transition-all duration-150 cursor-pointer"
              aria-label="Toggle dark mode"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Moon size={20} className="text-blue-400 transition-transform duration-200" />
              ) : (
                <Sun size={20} className="text-amber-500 transition-transform duration-200" />
              )}
            </button>

            {/* Quick Switch to Tourist View Button */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 text-xs font-semibold transition"
              title="Switch to Tourist Client View"
            >
              <Globe size={18} className="text-blue-500 shrink-0" />
              <span>Tourist View</span>
            </Link>

            {/* Notifications Dropdown */}
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={toggleNotifications}
                className={`relative p-2 rounded-md active:scale-95 transition-all duration-150 cursor-pointer ${
                  showNotifications
                    ? 'bg-gray-100 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                }`}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={20} className="transition-transform duration-200" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-600 rounded-md shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-96 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-md shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden z-50 animate-dropdown">
                  <div className="p-3.5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-800 dark:text-zinc-100">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-[#003E83] dark:bg-blue-950/60 dark:text-blue-400 rounded-md">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#003E83] dark:text-blue-400 hover:underline font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
                    {loadingNotifs ? (
                      <div className="p-6 text-center text-gray-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-xs">Loading notifications...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 dark:text-zinc-500 text-xs">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs flex items-start gap-2.5 transition-colors duration-150 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/60 ${
                            !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div
                            className={`w-2 h-2 mt-1 rounded-md shrink-0 ${
                              !n.read ? 'bg-blue-600' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-zinc-200 truncate">
                              {n.title || n.subject || 'System Notification'}
                            </p>
                            <p className="text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                              {n.message || n.body}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                              {formatTimeAgo(n.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 border-t border-gray-200 dark:border-zinc-800 text-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <Link
                      to="/business/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-[#003E83] dark:text-blue-400 hover:underline font-medium"
                    >
                      View all in Notifications Center →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={toggleProfileMenu}
                className="p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 transition-all duration-150 cursor-pointer"
                aria-label="User Profile"
                title="Business Owner Profile"
              >
                <div
                  className={`w-8 h-8 rounded-md bg-blue-100 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 border flex items-center justify-center font-bold text-xs overflow-hidden transition-all duration-150 ${
                    showProfileMenu
                      ? 'border-[#003E83] ring-2 ring-blue-200 dark:ring-blue-900/50'
                      : 'border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : userName ? (
                    userName.charAt(0).toUpperCase()
                  ) : (
                    <User size={16} />
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-md shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden z-50 animate-dropdown">
                  <div className="px-3.5 py-3 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 border border-gray-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                      ) : userName ? (
                        userName.charAt(0).toUpperCase()
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">
                        {userName}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <Link
                      to="/business/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors duration-150"
                    >
                      <Store size={16} className="text-gray-400" />
                      <span>Manage Business Profile</span>
                    </Link>

                    <Link
                      to="/business/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors duration-150"
                    >
                      <Settings size={16} className="text-gray-400" />
                      <span>Settings & Account</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-md transition-colors duration-150"
                    >
                      <Globe size={16} className="text-blue-500" />
                      <span>Switch to Tourist App</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowLogoutAlert(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors duration-150 w-full text-left cursor-pointer"
                    >
                      <LogOut size={16} className="text-red-500 dark:text-red-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <BusinessLogoutAlert
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
      />
    </header>
  );
}
