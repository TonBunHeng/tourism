import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { getInitialTheme, applyTheme, isDarkTheme } from '../../utils/Theme';
import notificationService from '../../services/notificationService';

export default function DashboardHeader({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { showConfirm } = useAlert();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isDark, setIsDark] = useState(() => isDarkTheme(getInitialTheme()));

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const toggleDarkMode = () => {
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    setIsDark(!isDark);
  };

  useEffect(() => {
    let isMounted = true;
    notificationService.getNotifications({ limit: 5 })
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res || [];
        const list = Array.isArray(data) ? data : (data?.data || []);
        setNotifications(list);
        setUnreadCount(res?.meta?.unread_count ?? list.filter(n => !n.read).length);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const getPageTitle = (path) => {
    if (path === '/dashboard') return 'Management Overview';
    if (path === '/business/dashboard') return 'Business Dashboard';
    if (path.startsWith('/business/businesses/new')) return 'Register New Business';
    if (path.startsWith('/business/businesses')) return 'Hospitality Businesses';
    if (path.startsWith('/business/bookings')) return 'Guest Bookings & Reservations';
    if (path.startsWith('/business/analytics')) return 'Performance Analytics';
    if (path.startsWith('/business/reports')) return 'Reports & Financials';
    if (path === '/guide/dashboard') return 'Tour Guide Dashboard';
    if (path.startsWith('/guide/places/new')) return 'Add New Tourist Place';
    if (path.startsWith('/guide/places')) return 'Curated Tourist Places';
    if (path.startsWith('/guide/events/new')) return 'Create Cultural Event';
    if (path.startsWith('/guide/events')) return 'Events & Festivals';
    if (path.startsWith('/guide/gallery')) return 'Media Gallery Management';
    if (path.startsWith('/guide/reviews')) return 'Traveler Review Moderation';
    if (path.startsWith('/guide/inquiries')) return 'Tourist Inquiries';
    return 'Management Portal';
  };

  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    showConfirm('Are you sure you want to log out?', async () => {
      await logout();
      navigate('/login', { replace: true });
    }, {
      title: 'Confirm Sign Out',
      confirmText: 'Sign Out',
      cancelText: 'Stay Logged In',
      type: 'warning'
    });
  };

  return (
    <header className="h-18 px-4 sm:px-8 border-b border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            AngkorVerses Management & Service Operations
          </p>
        </div>
      </div>

      {/* Right Actions: Dark Mode, Notifications, Account Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#003E83] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#003E83] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden z-50 animate-fade-in p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Notifications
                </span>
                <Link
                  to="/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-[11px] font-bold text-[#003E83] dark:text-blue-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No notifications to display
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 text-xs space-y-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="font-bold text-gray-900 dark:text-white line-clamp-1">
                        {item.title || item.data?.title || 'System Alert'}
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-2">
                        {item.message || item.data?.message || item.body || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Account Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'M')}&background=003E83&color=fff`}
              alt={user?.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover ring-1 ring-white dark:ring-zinc-700"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-gray-900 dark:text-white block leading-tight truncate max-w-[100px]">
                {user?.name || 'Manager'}
              </span>
              <span className="text-[10px] text-gray-400 block capitalize truncate max-w-[100px]">
                {String(role || user?.role || 'user').replace(/_/g, ' ')}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-2 z-50 animate-fade-in text-xs space-y-1">
              <div className="p-3 border-b border-gray-100 dark:border-zinc-800/80 mb-1">
                <p className="font-extrabold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium"
              >
                <User size={15} className="text-gray-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium"
              >
                <Settings size={15} className="text-gray-400" />
                <span>Account Settings</span>
              </Link>

              <div className="border-t border-gray-100 dark:border-zinc-800 my-1"></div>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
