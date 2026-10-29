import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  CalendarCheck, 
  Clock, 
  Star, 
  BarChart3, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  LogOut, 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleTheme, isDarkTheme, getInitialTheme } from '../utils/Theme';
import businessOwnerService from '../services/businessOwnerService';
import logoImg from '../assets/images/tourism_logo.png';

export default function BusinessOwnerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(getInitialTheme());
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('business_sidebar_expanded');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    localStorage.setItem('business_sidebar_expanded', JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  const refreshBusinesses = useCallback(async (preferredBusinessId = null) => {
    try {
      const res = await businessOwnerService.getBusinesses();
      if (!res?.success) return;

      const rawBusinesses = res.data?.businesses || res.data || [];
      const list = Array.isArray(rawBusinesses) ? rawBusinesses : [];
      setBusinesses(list);
      setSelectedBusiness((current) =>
        list.find((business) => business.id === preferredBusinessId) ||
        list.find((business) => business.id === current?.id) ||
        list[0] ||
        null
      );
    } catch {
      // Keep the current portal state if the refresh request fails.
    }
  }, []);

  useEffect(() => {
    refreshBusinesses();
  }, [refreshBusinesses]);

  const handleToggleTheme = () => {
    const next = toggleTheme(theme);
    setTheme(next);
  };

  const navItems = [
    { label: 'Dashboard', path: '/business/dashboard', icon: LayoutDashboard },
    { label: 'Business Profile', path: '/business/profile', icon: Store },
    { label: 'Listings & Services', path: '/business/listings', icon: Package },
    { label: 'Bookings', path: '/business/bookings', icon: CalendarCheck },
    { label: 'Operating Hours', path: '/business/availability', icon: Clock },
    { label: 'Customer Reviews', path: '/business/reviews', icon: Star },
    { label: 'Sales & Reports', path: '/business/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/business/notifications', icon: Bell },
    { label: 'Settings', path: '/business/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const match = navItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
    return match ? match.label : 'Business Hub';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-zinc-100 font-sans transition-colors duration-200 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 z-30 select-none ${
          isSidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-zinc-800">
          <Link to="/business/dashboard" className="flex items-center gap-3 overflow-hidden">
            <img src={logoImg} alt="AngkorVerses Logo" className="w-8 h-8 object-contain shrink-0" />
            {isSidebarExpanded && (
              <div className="leading-tight">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-[#002D62] to-blue-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  AngkorVerses
                </span>
                <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                  Business Hub
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={isSidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isSidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Business Selector Widget (when expanded) */}
        {isSidebarExpanded && (
          <div className="p-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1 px-1">
              Active Business
            </div>
            {selectedBusiness ? (
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {selectedBusiness.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedBusiness.verification_status === 'approved' ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        <AlertCircle size={11} /> {selectedBusiness.verification_status || 'Pending'}
                      </span>
                    )}
                  </div>
                </div>
                <Building2 size={16} className="text-[#002D62] dark:text-blue-400 shrink-0" />
              </div>
            ) : (
              <Link 
                to="/business/profile" 
                className="block text-center p-2 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-xs font-semibold text-[#002D62] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 transition"
              >
                + Register Business Profile
              </Link>
            )}
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/business/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#002D62] text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={!isSidebarExpanded ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {isSidebarExpanded && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Link to Tourist View */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition"
            title="Switch to Tourist Portal"
          >
            <Globe size={18} className="shrink-0 text-blue-500" />
            {isSidebarExpanded && <span className="truncate">Tourist Client View</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="text-xs font-medium text-slate-400 dark:text-zinc-500 hidden sm:block">
                Business Management Hub
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkTheme(theme) ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
            </button>

            {/* Notifications Shortcut */}
            <Link
              to="/business/notifications"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              title="Notifications"
            >
              <Bell size={19} />
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#002D62] to-blue-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'B'
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">
                    {user?.name || 'Business Owner'}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Owner Account
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-dropdown"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {user?.email}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/business/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      <Store size={15} />
                      <span>Manage Business Profile</span>
                    </Link>
                    <Link
                      to="/business/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      <Settings size={15} />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      <Globe size={15} />
                      <span>Switch to Tourist App</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#002D62] text-white'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                <Globe size={16} />
                <span>Switch to Tourist App</span>
              </Link>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ selectedBusiness, businesses, refreshBusinesses }} />
        </main>
      </div>
    </div>
  );
}
