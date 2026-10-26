import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  Calendar,
  CalendarCheck, 
  Image as ImageIcon, 
  Heart, 
  Award, 
  User, 
  LogOut, 
  Menu, 
  X, 
  MessageSquare, 
  ShieldAlert, 
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Check,
  Bell,
  CheckCheck,
  ArrowRight,
  Briefcase,
  LayoutDashboard,
  FileSpreadsheet,
  Info,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { useAlert } from '../../context/AlertContext';
import { getInitialTheme, applyTheme, THEME_CHANGE_EVENT, isDarkTheme } from '../../utils/Theme';
import notificationService from '../../services/notificationService';
import logoImg from '../../assets/tourism_logo.png';

export default function Header() {
  const { user, isAuthenticated, logout, openAuthModal, isBusinessOwner } = useAuth();
  const { showConfirm } = useAlert();
  const { wishlistCount, toggleChat } = useTravel();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const [currentTheme, setCurrentTheme] = useState(() => getInitialTheme());
  const [, setIsDarkMode] = useState(() => isDarkTheme(getInitialTheme()));

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const fetchTravelNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationService.getNotifications({ limit: 5 });
      const data = res?.data || res || [];
      const notifs = Array.isArray(data) ? data : (data.data || []);
      setNotifications(notifs);

      if (res?.meta?.unread_count !== undefined) {
        setUnreadCount(res.meta.unread_count);
      } else {
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch {
      // Gracefully ignore network errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    const loadNotifs = async () => {
      if (isMounted) {
        await fetchTravelNotifications();
      }
    };
    loadNotifs();

    const handleUpdate = () => fetchTravelNotifications();
    window.addEventListener('travel-notifications-updated', handleUpdate);
    const interval = setInterval(fetchTravelNotifications, 45000);
    return () => {
      isMounted = false;
      window.removeEventListener('travel-notifications-updated', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchTravelNotifications]);

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to log out of your account?',
      confirmText: 'Sign Out',
      type: 'logout'
    });
    if (confirmed) {
      logout();
      setDropdownOpen(false);
      setNotifDropdownOpen(false);
      setMenuOpen(false);
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail) {
        if (e.detail.theme) {
          setCurrentTheme(e.detail.theme);
        }
        if (typeof e.detail.isDark === 'boolean') {
          setIsDarkMode(e.detail.isDark);
        }
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const handleSelectTheme = (theme) => {
    applyTheme(theme);
    setCurrentTheme(theme);
    setIsDarkMode(isDarkTheme(theme));
    setThemeDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifDropdownOpen(false);
    setThemeDropdownOpen(false);
  }, [location.pathname]);



  const markSingleRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setNotifDropdownOpen(false);
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const normRole = (user?.role || '').toLowerCase().trim().replace(/[\s/-]+/g, '_');
  const isTourGuide = ['tour_guide', 'guide_editor', 'content_editor', 'guide'].includes(normRole);

  const navLinks = [
    { name: 'Destinations', path: '/places', icon: Compass },
    { name: 'Tours', path: '/tours', icon: Sparkles },
    { name: 'Guides', path: '/guides', icon: User },
    { name: 'Businesses', path: '/businesses', icon: Briefcase },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'Reviews', path: '/reviews', icon: MessageSquare },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: PhoneCall },
  ];

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getDashboardPath = () => {
    if (isBusinessOwner) return '/business/dashboard';
    if (isTourGuide) return '/guide/dashboard';
    return '/profile';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-zinc-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 xl:gap-3">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#003E83]/10 dark:bg-blue-900/30 flex items-center justify-center p-1.5 border border-blue-200/60 dark:border-blue-900/50 shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src={logoImg}
                alt="AngkorVerses"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight block group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors">
                Angkor<span className="text-[#003E83] dark:text-blue-400">Verses</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Travel & Culture
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 shadow-2xs'
                      : 'text-gray-600 dark:text-zinc-300 hover:text-[#003E83] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#003E83] dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar & Action Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">





            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative shrink-0" ref={notifDropdownRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                    notifDropdownOpen
                      ? 'bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400'
                      : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 py-2 z-50 animate-smooth-pop text-xs">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full font-bold text-[10px]">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-[#003E83] dark:text-[#60a5fa] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800/60">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 transition-colors cursor-pointer flex items-start gap-3 ${
                              !n.read 
                                ? 'bg-blue-50/50 dark:bg-blue-950/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#003E83] dark:bg-blue-400' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold truncate ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-400'}`}>
                                {n.title || n.data?.title || 'Notification'}
                              </p>
                              <p className="text-gray-500 dark:text-zinc-400 text-[11px] line-clamp-2 mt-0.5">
                                {n.description || n.data?.description || n.message || ''}
                              </p>
                              <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 block">
                                {formatTimeAgo(n.created_at)}
                              </span>
                            </div>
                            {!n.read && (
                              <button
                                onClick={(e) => markSingleRead(n.id, e)}
                                className="text-gray-400 hover:text-[#003E83] p-1 cursor-pointer"
                                title="Mark as read"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-zinc-400">
                          <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-zinc-600 mb-2 opacity-50" />
                          <p className="text-xs font-medium">No notifications yet</p>
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2 border-t border-gray-100 dark:border-zinc-800 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs text-[#003E83] dark:text-[#60a5fa] hover:underline font-bold flex items-center justify-center gap-1"
                      >
                        <span>View all in Notifications Center</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Selector Dropdown (Light / Dark / Device) */}
            <div className="relative shrink-0" ref={themeDropdownRef}>
              <button
                type="button"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  themeDropdownOpen
                    ? 'bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-[#60a5fa]'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
                title={`Theme: ${currentTheme === 'system' ? 'Device' : currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`}
                aria-label="Select color theme"
              >
                {currentTheme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : currentTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <Monitor className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 py-1.5 z-50 animate-smooth-pop text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Theme
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      currentTheme === 'light'
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 text-[#003E83] dark:text-[#60a5fa] font-bold'
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </div>
                    {currentTheme === 'light' && <Check className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      currentTheme === 'dark'
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 text-[#003E83] dark:text-[#60a5fa] font-bold'
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Dark</span>
                    </div>
                    {currentTheme === 'dark' && <Check className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTheme('system')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      currentTheme === 'system'
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 text-[#003E83] dark:text-[#60a5fa] font-bold'
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Monitor className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                      <span>Device</span>
                    </div>
                    {currentTheme === 'system' && <Check className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Sign In / Register */}
            {isAuthenticated ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    dropdownOpen
                      ? 'border-[#003E83] dark:border-blue-400 bg-blue-50/50 dark:bg-zinc-800'
                      : 'border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800/80 hover:bg-gray-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-white dark:ring-zinc-900"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#003E83] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="max-w-[85px] lg:max-w-[110px] truncate text-xs font-semibold text-gray-800 dark:text-zinc-200">
                    {user?.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 py-1.5 z-50 animate-smooth-pop text-xs">
                    <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-zinc-800/80">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                          {(user?.role || 'tourist').replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white truncate text-xs mt-0.5">{user?.name}</p>
                      <p className="text-gray-500 dark:text-zinc-400 truncate text-[11px]">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {/* Role Dashboard Link inside dropdown */}
                      {isBusinessOwner && (
                        <>
                          <Link
                          to={getDashboardPath()}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                            isLinkActive(getDashboardPath())
                              ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                              : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                          }`}
                        >
                          <LayoutDashboard className={`w-3.5 h-3.5 ${
                            isLinkActive(getDashboardPath())
                              ? 'text-[#003E83] dark:text-[#60a5fa]'
                              : 'text-gray-400 dark:text-zinc-500'
                          }`} /> 
                          <span>Business Dashboard</span>
                        </Link>
                        <Link
                          to="/business/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                            isLinkActive('/business/bookings')
                              ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                              : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                          }`}
                        >
                          <CalendarCheck className={`w-3.5 h-3.5 ${
                            isLinkActive('/business/bookings') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'
                          }`} />
                          <span>Customer Bookings</span>
                        </Link>
                        <Link
                          to="/business/reports"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                            isLinkActive('/business/reports')
                              ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                              : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                          }`}
                        >
                          <FileSpreadsheet className={`w-3.5 h-3.5 ${
                            isLinkActive('/business/reports') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'
                          }`} />
                          <span>Business Reports</span>
                        </Link>
                        </>
                      )}

                      {isTourGuide && (
                        <>
                          <Link
                            to="/guide/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                              isLinkActive('/guide/dashboard')
                                ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                                : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                            }`}
                          >
                            <LayoutDashboard className={`w-3.5 h-3.5 ${
                              isLinkActive('/guide/dashboard')
                                ? 'text-[#003E83] dark:text-[#60a5fa]'
                                : 'text-gray-400 dark:text-zinc-500'
                            }`} />
                            <span>Guide Portal</span>
                          </Link>
                          <Link
                            to="/guide/places"
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                              isLinkActive('/guide/places')
                                ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                                : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                            }`}
                          >
                            <Compass className={`w-3.5 h-3.5 ${
                              isLinkActive('/guide/places') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'
                            }`} />
                            <span>Curate Places</span>
                          </Link>
                        </>
                      )}

                      <Link
                        to="/travel-user"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/travel-user')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isLinkActive('/travel-user') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-amber-500'}`} />
                        <span className="font-bold text-[#003E83] dark:text-blue-300">Traveler Space</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/profile')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <User className={`w-3.5 h-3.5 ${isLinkActive('/profile') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'}`} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/trips"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/trips')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <Compass className={`w-3.5 h-3.5 ${isLinkActive('/trips') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'}`} />
                        <span>My Trips & Plans</span>
                      </Link>

                      <Link
                        to="/bookings"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/bookings')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <CalendarCheck className={`w-3.5 h-3.5 ${isLinkActive('/bookings') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'}`} />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        to="/tours"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/tours')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isLinkActive('/tours') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-amber-500'}`} />
                        <span>Recommended Tours</span>
                      </Link>

                      <Link
                        to="/notifications"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2 transition-colors ${
                          isLinkActive('/notifications')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className={`w-3.5 h-3.5 ${isLinkActive('/notifications') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'}`} />
                          <span>Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full font-bold text-[10px]">
                            {unreadCount}
                          </span>
                        )}
                      </Link>


                      <Link
                        to="/achievements"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/achievements')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <Award className={`w-3.5 h-3.5 ${isLinkActive('/achievements') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'}`} />
                        <span>Badges & Points</span>
                      </Link>

                      <button 
                        onClick={() => { setDropdownOpen(false); toggleChat(); }} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] text-left font-medium transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                        <span>AI Support Chat</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-zinc-800/80 py-1">
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/settings')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <Settings className={`w-3.5 h-3.5 ${isLinkActive('/settings') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'}`} />
                        <span>Emergency & Help</span>
                      </Link>

                      <Link
                        to="/deletion-request"
                        className={`flex items-center gap-2.5 px-3.5 py-2 transition-colors ${
                          isLinkActive('/deletion-request') || isLinkActive('/delete')
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 text-[#003E83] dark:text-[#60a5fa] font-bold'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#003E83] dark:hover:text-[#60a5fa] font-medium'
                        }`}
                      >
                        <ShieldAlert className={`w-3.5 h-3.5 ${isLinkActive('/deletion-request') || isLinkActive('/delete') ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400 dark:text-zinc-500'}`} />
                        <span>Privacy & Data</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-1">
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 text-gray-700 dark:text-zinc-300 hover:text-[#003E83] dark:hover:text-[#60a5fa] hover:bg-gray-100/70 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 text-white bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4 pb-24 space-y-3 animate-smooth-pop text-xs shadow-md relative z-50 max-h-[85vh] overflow-y-auto"
        >


          {/* Mobile Navigation Links */}
          <div className="space-y-1 pt-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-[#60a5fa]'
                      : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#003E83] dark:text-[#60a5fa]' : 'text-gray-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Access Badges/Links */}
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-2 space-y-1">
            {(isBusinessOwner) && (
              <Link
                to={getDashboardPath()}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-[#003E83] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
              >
                <LayoutDashboard className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                <span>Business Owner Dashboard</span>
              </Link>
            )}
            {(isBusinessOwner) && (
              <Link
                to="/business/bookings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <CalendarCheck className="w-4 h-4 text-[#003E83] dark:text-[#60a5fa]" />
                <span>Customer Bookings</span>
              </Link>
            )}
            {(isBusinessOwner) && (
              <Link
                to="/business/reports"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#003E83] dark:text-[#60a5fa]" />
                <span>Business Reports</span>
              </Link>
            )}
            {(isTourGuide) && (
              <>
                <Link
                  to="/guide/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-[#003E83] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Tour Guide Portal</span>
                </Link>
                <Link
                  to="/guide/places"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <Compass className="w-4 h-4 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>Curate Destinations</span>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link
                  to="/trips"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <Compass className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>My Trips & Itineraries</span>
                </Link>
                <Link
                  to="/bookings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  <span>My Bookings</span>
                </Link>
              </>
            )}


            <Link
              to="/achievements"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Badges & Achievements</span>
            </Link>

            <button
              onClick={() => {
                setMenuOpen(false);
                toggleChat();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-left"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>AI Support Assistant</span>
            </button>

            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              <span>Emergency Guidelines</span>
            </Link>

            {/* Appearance Toggle (Mobile) */}
            <div className="px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Theme</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003E83] dark:text-[#60a5fa]">
                  {currentTheme === 'system' ? 'Device' : currentTheme}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-gray-200/70 dark:bg-zinc-900 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleSelectTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    currentTheme === 'light'
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    currentTheme === 'dark'
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTheme('system')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    currentTheme === 'system'
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                  <span>Device</span>
                </button>
              </div>
            </div>
          </div>

          {/* Auth Section in Mobile Menu */}
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 pb-8">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-1">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#003E83] text-white font-bold text-xs flex items-center justify-center">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-gray-500 dark:text-zinc-400 text-[11px] truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pr-12 sm:pr-0">
                <button
                  onClick={() => openAuthModal('login')}
                  className="py-2 text-center font-bold rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="py-2 text-center font-bold rounded-lg bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shadow-xs"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
