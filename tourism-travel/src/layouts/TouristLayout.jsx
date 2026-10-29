import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  User,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  MapPin,
  ChevronDown,
  Building2,
  CalendarCheck,
  Sparkles,
  UserCheck,
  Tags,
  Globe,
  Images,
  CalendarDays,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleTheme, isDarkTheme, getInitialTheme } from '../utils/Theme';
import notificationService from '../services/notificationService';
import logoImg from '../assets/images/tourism_logo.png';
import AngkorGenieFloatingWidget from '../components/common/AngkorGenieFloatingWidget';

export default function TouristLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(getInitialTheme());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Dropdown & Mega Menu State ('destinations' | 'tours' | null)
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  // Refresh the notification badge when authentication or route changes.
  // Ignore late responses after navigation/unmount and reset on sign-out.
  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setUnreadCount(0);
      return undefined;
    }

    notificationService
      .getUnreadCount()
      .then((res) => {
        if (cancelled) return;

        const count = typeof res?.data?.unread_count === 'number'
          ? res.data.unread_count
          : typeof res?.unread_count === 'number'
            ? res.unread_count
            : null;

        if (count !== null) {
          setUnreadCount(count);
        }
      })
      .catch(() => {
        // Preserve the current badge count if the request temporarily fails.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, location.pathname]);

  // Close navigation menus whenever the route changes.
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);

    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  }, [location.pathname]);

  // Do not leave a pending timeout behind when this layout unmounts.
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
        dropdownTimeoutRef.current = null;
      }
    };
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme(theme);
    setTheme(next);
  };

  const handleOpenDropdown = (menuKey) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }

    setActiveDropdown(menuKey);
  };

  const handleCloseDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }

    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      dropdownTimeoutRef.current = null;
    }, 200);
  };

  // Active route helpers
  const isExploreActive = location.pathname === '/';

  const isDestinationsActive = ['/destinations', '/places', '/categories', '/provinces', '/galleries', '/events'].some(
    (p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p))
  );

  const isToursActive = ['/tours', '/tour-packages', '/guides', '/tour-guides', '/bookings', '/businesses', '/favorites'].some(
    (p) => location.pathname === p || location.pathname.startsWith(p)
  );

  const isSupportActive = location.pathname.startsWith('/support');

  const isItemActive = (path, aliases = []) => {
    const allPaths = [path, ...aliases];
    return allPaths.some((p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p + '/')));
  };

  const destinationsMenuItems = [
    {
      to: '/destinations',
      aliases: ['/places'],
      title: 'Places & Sites',
      description: 'Temples, landmarks, and parks',
      icon: MapPin,
      iconClass: 'bg-blue-50 dark:bg-blue-950/60 text-[#002D62] dark:text-blue-400',
    },
    {
      to: '/categories',
      title: 'Categories',
      description: 'Historical, eco, and coastal spots',
      icon: Tags,
      iconClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
    },
    {
      to: '/provinces',
      title: '25 Provinces',
      description: 'Nationwide regional discovery',
      icon: Globe,
      iconClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      to: '/galleries',
      title: 'Photo Galleries',
      description: 'Scenic captures & temple photos',
      icon: Images,
      iconClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      to: '/events',
      title: 'Events & Festivals',
      description: 'Cultural festivals & celebrations',
      icon: CalendarDays,
      iconClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
  ];

  const toursMenuItems = [
    {
      to: '/tours',
      aliases: ['/tour-packages'],
      title: 'Tour Packages',
      description: 'Curated itineraries & circuits',
      icon: Sparkles,
      iconClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      to: '/guides',
      aliases: ['/tour-guides'],
      title: 'Tour Guides',
      description: 'Accredited local guides',
      icon: UserCheck,
      iconClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      to: '/bookings',
      title: 'My Bookings',
      description: 'View & manage reservations',
      icon: CalendarCheck,
      iconClass: 'bg-blue-50 dark:bg-blue-950/60 text-[#002D62] dark:text-blue-400',
    },
    {
      to: '/businesses',
      title: 'Businesses',
      description: 'Verified service partners',
      icon: Building2,
      iconClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      to: '/favorites',
      title: 'Saved Wishlist',
      description: 'Bookmarked tours & saved trips',
      icon: Heart,
      iconClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <header
        className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors"
        onMouseLeave={handleCloseDropdown}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[88px] flex items-center justify-between relative">

          {/* Left: Round Emblem Logo + Dual-Line Khmer & English Branding */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0">
            <img
              src={logoImg}
              alt="Angkor Verse AI logo"
              className="size-[52px] object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center">
              <div className="font-extrabold text-xs sm:text-sm tracking-wider text-[#002D62] dark:text-zinc-100 uppercase leading-snug">
                ANGKOR VERSE
              </div>
            </div>
          </Link>

          {/* Center-Right: Navigation Links (ABOUT, DESTINATIONS & EXPLORATION, TOURS & BOOKINGS, RESEARCH) */}
          <nav className="hidden lg:flex items-center h-full gap-8 xl:gap-10">
            {/* 1. ABOUT */}
            <Link
              to="/"
              className="h-full flex flex-col justify-center items-center group relative cursor-pointer"
            >
              <span className={`text-xs xl:text-sm font-bold tracking-wider uppercase transition-colors ${isExploreActive
                ? 'text-red-600 dark:text-red-500'
                : 'text-[#002D62] dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                }`}>
                HOME
              </span>
              <span className={`w-full h-1 mt-1.5 rounded-full transition-all duration-200 ${isExploreActive ? 'bg-red-600 dark:bg-red-500' : 'bg-transparent group-hover:bg-red-600/40'
                }`} />
            </Link>

            {/* 2. DESTINATIONS & EXPLORATION */}
            <div
              className="h-full flex flex-col justify-center items-center group relative"
              onMouseEnter={() => handleOpenDropdown('destinations')}
            >
              <div className="flex items-center gap-1">
                <Link
                  to="/destinations"
                  className={`text-xs xl:text-sm font-bold tracking-wider uppercase transition-colors ${isDestinationsActive || activeDropdown === 'destinations'
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-[#002D62] dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                    }`}
                >
                  DESTINATIONS & EXPLORATION
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveDropdown((curr) => curr === 'destinations' ? null : 'destinations')}
                  aria-label="Toggle destinations and exploration menu"
                  aria-expanded={activeDropdown === 'destinations'}
                  aria-controls="destinations-dropdown-menu"
                  className="p-1 rounded text-current hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isDestinationsActive || activeDropdown === 'destinations' ? 'text-red-600 dark:text-red-500' : ''} ${activeDropdown === 'destinations' ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
              <span className={`w-full h-1 mt-1.5 rounded-full transition-all duration-200 ${isDestinationsActive || activeDropdown === 'destinations'
                ? 'bg-red-600 dark:bg-red-500'
                : 'bg-transparent group-hover:bg-red-600/40'
                }`} />
            </div>

            {/* 3. TOURS & BOOKINGS (Includes Tours, Guides, Bookings, Businesses, and Wishlist) */}
            <div
              className="h-full flex flex-col justify-center items-center group relative"
              onMouseEnter={() => handleOpenDropdown('tours')}
            >
              <div className="flex items-center gap-1">
                <Link
                  to="/tours"
                  className={`text-xs xl:text-sm font-bold tracking-wider uppercase transition-colors ${isToursActive || activeDropdown === 'tours'
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-[#002D62] dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                    }`}
                >
                  TOURS & BOOKINGS
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveDropdown((curr) => curr === 'tours' ? null : 'tours')}
                  aria-label="Toggle tours and bookings menu"
                  aria-expanded={activeDropdown === 'tours'}
                  aria-controls="tours-dropdown-menu"
                  className="p-1 rounded text-current hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isToursActive || activeDropdown === 'tours' ? 'text-red-600 dark:text-red-500' : ''} ${activeDropdown === 'tours' ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
              <span className={`w-full h-1 mt-1.5 rounded-full transition-all duration-200 ${isToursActive || activeDropdown === 'tours'
                ? 'bg-red-600 dark:bg-red-500'
                : 'bg-transparent group-hover:bg-red-600/40'
                }`} />
            </div>

            {/* 4. RESEARCH */}
            <Link
              to="/support"
              className="h-full flex flex-col justify-center items-center group relative cursor-pointer"
            >
              <span className={`text-xs xl:text-sm font-bold tracking-wider uppercase transition-colors ${isSupportActive
                ? 'text-red-600 dark:text-red-500'
                : 'text-[#002D62] dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                }`}>
                RESEARCH
              </span>
              <span className={`w-full h-1 mt-1.5 rounded-full transition-all duration-200 ${isSupportActive ? 'bg-red-600 dark:bg-red-500' : 'bg-transparent group-hover:bg-red-600/40'
                }`} />
            </Link>
          </nav>

          {/* Far Right Utility Actions (Theme, Notifications, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkTheme(theme) ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                  title="Notifications"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((open) => !open)}
                    aria-label="Open account menu"
                    aria-expanded={isProfileMenuOpen}
                    aria-controls="tourist-profile-menu"
                    className={`flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer ${
                      location.pathname === '/profile' ? 'ring-2 ring-red-500/80 bg-red-50/30 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <ChevronDown size={13} className={location.pathname === '/profile' ? 'text-red-500 font-bold' : 'text-slate-400'} />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      id="tourist-profile-menu"
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
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition ${
                            location.pathname === '/profile'
                              ? 'text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40'
                              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <User size={14} className={location.pathname === '/profile' ? 'text-red-600 dark:text-red-400' : 'text-slate-400'} />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition ${
                            location.pathname === '/bookings'
                              ? 'text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40'
                              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Calendar size={14} className={location.pathname === '/bookings' ? 'text-red-600 dark:text-red-400' : 'text-slate-400'} />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition ${
                            location.pathname === '/favorites'
                              ? 'text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40'
                              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Heart size={14} className={location.pathname === '/favorites' ? 'text-red-600 fill-red-600' : 'text-rose-500'} />
                          <span>Saved Wishlist</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#002D62] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#002D62] hover:bg-[#001f44] text-white shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="tourist-mobile-navigation"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* 3.1 DESTINATIONS DROPDOWN MENU */}
        {activeDropdown === 'destinations' && (
          <div
            id="destinations-dropdown-menu"
            role="region"
            aria-label="Destinations menu"
            className="hidden lg:block absolute left-0 right-0 top-full pt-1 z-50 pointer-events-auto"
            onMouseEnter={() => handleOpenDropdown('destinations')}
            onMouseLeave={handleCloseDropdown}
          >
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 p-6 animate-dropdown">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#002D62] dark:text-blue-400 tracking-wide">
                      Destinations & Exploration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Explore Cambodia's historic landmarks, 25 provinces, and cultural treasures.
                    </p>
                  </div>
                  <Link
                    to="/destinations"
                    onClick={() => setActiveDropdown(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {destinationsMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.to, item.aliases);

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setActiveDropdown(null)}
                        className={`group flex items-start gap-3 p-3 rounded-xl transition ${
                          active
                            ? 'bg-red-50/80 dark:bg-red-950/40 ring-1 ring-red-200 dark:ring-red-900/60 shadow-xs'
                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl transition-all ${
                            active
                              ? 'bg-red-600 text-white shadow-xs scale-105'
                              : `${item.iconClass} group-hover:scale-105`
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div
                            className={`text-sm font-bold transition-colors ${
                              active
                                ? 'text-red-600 dark:text-red-400 font-extrabold'
                                : 'text-slate-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400'
                            }`}
                          >
                            {item.title}
                          </div>
                          <div
                            className={`text-xs mt-0.5 transition-colors ${
                              active
                                ? 'text-red-600/80 dark:text-red-400/80 font-medium'
                                : 'text-slate-500 dark:text-zinc-400'
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3.2 TOURS & BOOKINGS DROPDOWN MENU (No Destinations) */}
        {activeDropdown === 'tours' && (
          <div
            id="tours-dropdown-menu"
            role="region"
            aria-label="Tours and bookings menu"
            className="hidden lg:block absolute left-0 right-0 top-full pt-1 z-50 pointer-events-auto"
            onMouseEnter={() => handleOpenDropdown('tours')}
            onMouseLeave={handleCloseDropdown}
          >
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 p-6 animate-dropdown">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#002D62] dark:text-blue-400 tracking-wide">
                      Tours & Bookings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Curated guided experiences, certified guides, and reservation management.
                    </p>
                  </div>
                  <Link
                    to="/tours"
                    onClick={() => setActiveDropdown(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {toursMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.to, item.aliases);

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setActiveDropdown(null)}
                        className={`group flex items-start gap-3 p-3 rounded-xl transition ${
                          active
                            ? 'bg-red-50/80 dark:bg-red-950/40 ring-1 ring-red-200 dark:ring-red-900/60 shadow-xs'
                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl transition-all ${
                            active
                              ? 'bg-red-600 text-white shadow-xs scale-105'
                              : `${item.iconClass} group-hover:scale-105`
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div
                            className={`text-sm font-bold transition-colors ${
                              active
                                ? 'text-red-600 dark:text-red-400 font-extrabold'
                                : 'text-slate-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400'
                            }`}
                          >
                            {item.title}
                          </div>
                          <div
                            className={`text-xs mt-0.5 transition-colors ${
                              active
                                ? 'text-red-600/80 dark:text-red-400/80 font-medium'
                                : 'text-slate-500 dark:text-zinc-400'
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <div
            id="tourist-mobile-navigation"
            className="lg:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-3 pb-6 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition ${
                isExploreActive
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                  : 'text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>About / Explore</span>
              <ArrowRight size={14} className={isExploreActive ? 'text-red-600 dark:text-red-400' : 'text-slate-400'} />
            </Link>

            {/* Destinations & Exploration */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#002D62] dark:text-blue-400 tracking-wider px-3 mb-1">
                Destinations & Exploration
              </div>
              {destinationsMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.to, item.aliases);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold'
                        : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={15} className={active ? 'text-red-600 dark:text-red-400' : 'text-slate-400'} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>

            {/* Tours & Bookings */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-[#002D62] dark:text-blue-400 tracking-wider px-3 mb-1">
                Tours & Bookings
              </div>
              {toursMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.to, item.aliases);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold'
                        : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={15} className={active ? 'text-red-600 dark:text-red-400' : 'text-slate-400'} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
              <Link
                to="/support"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isSupportActive
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                Research & Support
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Intro */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <img src={logoImg} alt="Angkor Verse AI logo" className="w-8 h-8 object-contain" />
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Angkor Verse AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                Your digital gateway to discover Cambodia’s ancient Khmer heritage, vibrant provincial culture, beautiful islands, and authentic local experiences.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-[#002D62] dark:text-blue-400">
                <MapPin size={14} />
                <span>Phnom Penh & Siem Reap, Cambodia</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Destinations & Tours
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <li><Link to="/destinations" className="hover:text-[#002D62] dark:hover:text-blue-400">Top Cambodian Places</Link></li>
                <li><Link to="/tours" className="hover:text-[#002D62] dark:hover:text-blue-400">Tour Packages & Sunrise Circuits</Link></li>
                <li><Link to="/guides" className="hover:text-[#002D62] dark:hover:text-blue-400">Certified Local Guides</Link></li>
                <li><Link to="/provinces" className="hover:text-[#002D62] dark:hover:text-blue-400">Explore 25 Provinces</Link></li>
                <li><Link to="/businesses" className="hover:text-[#002D62] dark:hover:text-blue-400">Verified Tourism Businesses</Link></li>
              </ul>
            </div>

            {/* Festivals & Media */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Culture & Media
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <li><Link to="/events" className="hover:text-[#002D62] dark:hover:text-blue-400">Festivals & Celebrations</Link></li>
                <li><Link to="/galleries" className="hover:text-[#002D62] dark:hover:text-blue-400">Scenic Photo Galleries</Link></li>
                <li><Link to="/categories" className="hover:text-[#002D62] dark:hover:text-blue-400">Experience Categories</Link></li>
                <li><Link to="/ai-chat" className="hover:text-[#002D62] dark:hover:text-blue-400">AngkorGenie AI Travel Assistant</Link></li>
                <li><Link to="/support" className="hover:text-[#002D62] dark:hover:text-blue-400">Traveler Support & Inquiries</Link></li>
              </ul>
            </div>

            {/* Emergency & Safe Travel */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Emergency & Safe Travel
              </h4>
              <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                  <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Tourist Police Helpline</span>
                    <span className="font-mono text-[#002D62] dark:text-blue-400 font-bold">117</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                  <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Emergency Ambulance</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">119</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-zinc-500 gap-3">
            <div>
              © {new Date().getFullYear()} Angkor Verse AI. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/support" className="hover:underline">Privacy Policy</Link>
              <Link to="/support" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* AngkorGenie Floating Widget (FAB & Chat Drawer) */}
      <AngkorGenieFloatingWidget />
    </div>
  );
}
