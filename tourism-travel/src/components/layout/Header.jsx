import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Smartphone,
  Building,
  Globe,
  Headphones,
  CalendarCheck,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronDown,
  Sparkles,
  Coins,
  Heart,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { useAlert } from '../../context/AlertContext';
import { getInitialTheme, applyTheme, THEME_CHANGE_EVENT, isDarkTheme } from '../../utils/Theme';
import notificationService from '../../services/notificationService';

export default function Header({
  onToggleSidebar = () => {},
  isSidebarExpanded = true,
  onToggleMobileSidebar = () => {},
  onOpenAppModal = () => {},
  onOpenSupportModal = () => {}
}) {
  const { user, isAuthenticated, logout, openAuthModal, isBusinessOwner } = useAuth();
  const { showConfirm } = useAlert();
  const { wishlistCount } = useTravel();
  const navigate = useNavigate();
  const location = useLocation();

  // Header Search Input State
  const [headerSearch, setHeaderSearch] = useState('');

  // Dropdown States
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Currency Selection
  const [currency, setCurrency] = useState('USD');

  // Theme State
  const [currentTheme, setCurrentTheme] = useState(() => getInitialTheme());
  const [, setIsDarkMode] = useState(() => isDarkTheme(getInitialTheme()));

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

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
    if (isMounted) {
      fetchTravelNotifications();
    }
    const handleUpdate = () => fetchTravelNotifications();
    window.addEventListener('travel-notifications-updated', handleUpdate);
    const interval = setInterval(fetchTravelNotifications, 45000);
    return () => {
      isMounted = false;
      window.removeEventListener('travel-notifications-updated', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchTravelNotifications]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail) {
        if (e.detail.theme) setCurrentTheme(e.detail.theme);
        if (typeof e.detail.isDark === 'boolean') setIsDarkMode(e.detail.isDark);
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
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setCurrencyDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setNotifDropdownOpen(false);
    setCurrencyDropdownOpen(false);
    setThemeDropdownOpen(false);
  }, [location.pathname]);

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/places?search=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your Trip.com account?',
      confirmText: 'Sign Out',
      type: 'logout'
    });
    if (confirmed) {
      logout();
      setDropdownOpen(false);
      navigate('/', { replace: true });
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-900 border-b border-gray-200/90 dark:border-zinc-800 transition-colors shadow-xs">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Sidebar Toggle + Trip.com Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop Hamburger Toggle */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isSidebarExpanded ? 'Collapse menu' : 'Expand menu'}
              aria-label="Toggle sidebar menu"
            >
              <Menu size={20} />
            </button>

            {/* Mobile Drawer Hamburger */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu size={20} />
            </button>

            {/* Trip.com Iconic Wordmark */}
            <Link to="/" className="flex items-center gap-2 group select-none">
              <span className="text-2xl sm:text-[26px] font-black tracking-tight text-[#0f294d] dark:text-white transition-colors">
                Trip<span className="text-[#287dfa]">.com</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-[#287dfa] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                Cambodia
              </span>
            </Link>
          </div>

          {/* Middle: Trip.com Global Search Input Bar */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 lg:mx-6">
            <form onSubmit={handleHeaderSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Destination, attraction, hotel, etc."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full h-10 pl-4 pr-11 bg-gray-100/90 dark:bg-zinc-800/90 hover:bg-gray-100 focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-[13px] rounded-full border border-transparent focus:border-[#287dfa] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 outline-none transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full bg-[#287dfa] hover:bg-[#1a6de8] text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs"
                title="Search"
              >
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Right: Trip Utilities Bar */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 text-xs font-semibold text-[#0f294d] dark:text-zinc-200 shrink-0">
            
            {/* App Promotion Trigger */}
            <button
              type="button"
              onClick={onOpenAppModal}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-gray-700 dark:text-zinc-300"
              title="Get Trip.com Mobile App"
            >
              <Smartphone size={16} className="text-gray-500" />
              <span>App</span>
            </button>

            {/* List Your Property / Business */}
            <Link
              to={isBusinessOwner ? '/business/dashboard' : '/businesses'}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-zinc-300"
            >
              <Building size={16} className="text-gray-500" />
              <span>List your property</span>
            </Link>

            {/* Currency & Language Selector */}
            <div className="relative" ref={currencyDropdownRef}>
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-gray-700 dark:text-zinc-300"
                title="Select Currency"
              >
                <Globe size={16} className="text-[#287dfa]" />
                <span className="font-bold">{currency}</span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Select Currency
                  </div>
                  {[
                    { code: 'USD', label: 'USD ($) - US Dollar' },
                    { code: 'KHR', label: 'KHR (៛) - Khmer Riel' },
                    { code: 'EUR', label: 'EUR (€) - Euro' },
                    { code: 'GBP', label: 'GBP (£) - British Pound' }
                  ].map((cur) => (
                    <button
                      key={cur.code}
                      type="button"
                      onClick={() => {
                        setCurrency(cur.code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-[#287dfa]"
                    >
                      <span>{cur.label}</span>
                      {currency === cur.code && <Check size={14} className="text-[#287dfa]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Support 24/7 */}
            <button
              type="button"
              onClick={onOpenSupportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-gray-700 dark:text-zinc-300"
              title="24/7 Customer Support"
            >
              <Headphones size={16} className="text-gray-500" />
              <span className="hidden sm:inline">Customer support</span>
            </button>

            {/* Find Bookings */}
            <Link
              to="/bookings"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-zinc-300"
              title="My Bookings"
            >
              <CalendarCheck size={16} className="text-gray-500" />
              <span className="hidden sm:inline">Find bookings</span>
            </Link>

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifDropdownRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Trip Alerts</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-[11px] font-semibold text-[#287dfa] hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">
                          No new trip notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer ${
                              !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20 font-bold' : ''
                            }`}
                          >
                            <p className="text-gray-900 dark:text-zinc-200 line-clamp-2">{n.message || n.title}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-zinc-800 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs font-bold text-[#287dfa] hover:underline"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle Dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                type="button"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Appearance"
              >
                {currentTheme === 'dark' ? <Moon size={18} /> : currentTheme === 'light' ? <Sun size={18} /> : <Monitor size={18} />}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor }
                  ].map((t) => {
                    const TIcon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTheme(t.id)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                      >
                        <span className="flex items-center gap-2">
                          <TIcon size={14} />
                          {t.label}
                        </span>
                        {currentTheme === t.id && <Check size={14} className="text-[#287dfa]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Account / Sign In & Register */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-gray-200 dark:border-zinc-700 hover:border-[#287dfa] transition-all cursor-pointer bg-gray-50/50 dark:bg-zinc-800/40"
                >
                  <div className="w-7 h-7 rounded-full bg-[#287dfa] text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.[0] || 'T'
                    )}
                  </div>
                  <span className="hidden md:inline font-bold text-xs truncate max-w-[100px] text-gray-800 dark:text-zinc-200">
                    {user?.name || 'Traveler'}
                  </span>
                  <ChevronDown size={13} className="text-gray-400 mr-1" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-2 z-50 animate-in fade-in space-y-1">
                    {/* Member Tier Card */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800/80 mb-2 border border-blue-100 dark:border-zinc-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0f294d] dark:text-white">Diamond Member</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-gray-900">
                          Tier 4
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#287dfa]">
                        <Coins size={14} className="text-amber-500" />
                        <span>1,250 Trip Coins ($12.50)</span>
                      </div>
                    </div>

                    <Link
                      to="/travel-user"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-[#287dfa]"
                    >
                      <User size={15} />
                      <span>Traveler Space</span>
                    </Link>

                    <Link
                      to="/bookings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-[#287dfa]"
                    >
                      <CalendarCheck size={15} />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/favorites"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-[#287dfa]"
                    >
                      <Heart size={15} />
                      <div className="flex items-center justify-between flex-1">
                        <span>Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-600 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </div>
                    </Link>

                    <Link
                      to="/achievements"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-[#287dfa]"
                    >
                      <Coins size={15} />
                      <span>Trip Coins & Badges</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-[#287dfa]"
                    >
                      <Settings size={15} />
                      <span>Account Settings</span>
                    </Link>

                    <div className="pt-1 border-t border-gray-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="px-4 py-2 rounded-xl bg-[#287dfa] hover:bg-[#1a6de8] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Sign in / Register
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
