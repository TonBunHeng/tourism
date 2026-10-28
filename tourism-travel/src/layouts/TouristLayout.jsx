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

  // Mega Menu State
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef(null);

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
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);

    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
  }, [location.pathname]);

  // Do not leave a pending timeout behind when this layout unmounts.
  useEffect(() => {
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
        megaMenuTimeoutRef.current = null;
      }
    };
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme(theme);
    setTheme(next);
  };

  const handleOpenMegaMenu = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }

    setIsMegaMenuOpen(true);
  };

  const handleCloseMegaMenu = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }

    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      megaMenuTimeoutRef.current = null;
    }, 200);
  };

  // Active route helpers
  const isExploreActive = location.pathname === '/';

  const isDestinationsActive = ['/destinations', '/places', '/categories', '/provinces', '/galleries', '/events'].some(
    (p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p))
  );

  const isToursActive = ['/tours', '/tour-packages', '/guides', '/tour-guides', '/bookings'].some(
    (p) => location.pathname === p || location.pathname.startsWith(p)
  );

  const isBusinessesActive = location.pathname.startsWith('/businesses');
  const isSupportActive = location.pathname.startsWith('/support');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <header
        className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors"
        onMouseLeave={handleCloseMegaMenu}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[88px] flex items-center justify-between relative">

          {/* Left: Round Emblem Logo + Dual-Line Khmer & English Branding (Matches Picture 2) */}
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

          {/* Center-Right: Navigation Links Styled EXACTLY like Picture 2 (4 Items: ABOUT, TOURS & BOOKINGS, PARTNERSHIP, RESEARCH) */}
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
                ABOUT
              </span>
              <span className={`w-full h-1 mt-1.5 rounded-full transition-all duration-200 ${isExploreActive ? 'bg-red-600 dark:bg-red-500' : 'bg-transparent group-hover:bg-red-600/40'
                }`} />
            </Link>

            {/* 2. TOURS & BOOKINGS (Triggers Mega-Menu with Red Underline like ACADEMICS in Picture 2) */}
            <div
              className="h-full flex flex-col justify-center items-center group relative"
              onMouseEnter={handleOpenMegaMenu}
            >
              <div className="flex items-center gap-1">
                <Link
                  to="/tours"
                  className={`text-xs xl:text-sm font-bold tracking-wider uppercase transition-colors ${isToursActive || isDestinationsActive || isMegaMenuOpen
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-[#002D62] dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                    }`}
                >
                  TOURS & BOOKINGS
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMegaMenuOpen((open) => !open)}
                  aria-label="Toggle tours and bookings menu"
                  aria-expanded={isMegaMenuOpen}
                  aria-controls="tourism-mega-menu"
                  className="p-1 rounded text-current hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
              <span className={`w-full h-1 mt-1.5 rounded-full transition-all duration-200 ${isToursActive || isDestinationsActive || isMegaMenuOpen
                ? 'bg-red-600 dark:bg-red-500'
                : 'bg-transparent group-hover:bg-red-600/40'
                }`} />
            </div>

            {/* 3. PARTNERSHIP */}
            <Link
              to="/businesses"
              className="h-full flex flex-col justify-center items-center group relative cursor-pointer"
            >
              <span className={`text-xs xl:text-sm font-bold tracking-wider uppercase transition-colors ${isBusinessesActive
                ? 'text-red-600 dark:text-red-500'
                : 'text-[#002D62] dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                }`}>
                PARTNERSHIP
              </span>
              <span className={`w-full h-1 mt-1.5 rounded-full transition-all duration-200 ${isBusinessesActive ? 'bg-red-600 dark:bg-red-500' : 'bg-transparent group-hover:bg-red-600/40'
                }`} />
            </Link>

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
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <ChevronDown size={13} className="text-slate-400" />
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
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                          <User size={14} className="text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                          <Calendar size={14} className="text-slate-400" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                          <Heart size={14} className="text-rose-500" />
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

        {/* 3. MEGA-MENU DROPDOWN CARD (Floating White Card Exactly Matching Picture 2) */}
        {isMegaMenuOpen && (
          <div
            id="tourism-mega-menu"
            role="region"
            aria-label="Tours, bookings, and destinations menu"
            className="hidden lg:block absolute left-0 right-0 top-full pt-1 z-50 pointer-events-auto"
            onMouseEnter={handleOpenMegaMenu}
            onMouseLeave={handleCloseMegaMenu}
          >
            <div className="max-w-5xl mx-auto px-2">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 p-8 grid grid-cols-12 gap-8 items-start animate-dropdown">
                {/* Middle Section: Tours & Bookings (Clean typography like Faculty in Picture 2) */}
                <div className="col-span-5 space-y-5">
                  <h3 className="text-base font-extrabold text-[#002D62] dark:text-blue-400 tracking-wide">
                    Tours & Bookings
                  </h3>

                  <div className="space-y-3 text-sm">
                    <Link
                      to="/businesses"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Businesses
                    </Link>

                    <Link
                      to="/bookings"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Bookings
                    </Link>

                    <Link
                      to="/tours"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Tour Packages
                    </Link>

                    <Link
                      to="/guides"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Tour Guides
                    </Link>
                  </div>
                </div>

                {/* Right Section: Destinations (Clean typography with Divider line like Programs & Courses in Picture 2) */}
                <div className="col-span-4 border-l border-slate-200 dark:border-zinc-800 pl-8 space-y-4">
                  <h3 className="text-base font-extrabold text-[#002D62] dark:text-blue-400 tracking-wide">
                    Destinations
                  </h3>

                  <div className="space-y-3 text-sm">
                    <Link
                      to="/categories"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Categories
                    </Link>

                    <Link
                      to="/destinations"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Places
                    </Link>

                    <Link
                      to="/provinces"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Provinces
                    </Link>

                    <Link
                      to="/galleries"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Galleries
                    </Link>

                    <Link
                      to="/events"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block font-semibold text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Events
                    </Link>
                  </div>
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
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <span>About / Explore</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>

            {/* Tours & Bookings */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#002D62] dark:text-blue-400 tracking-wider px-3 mb-1">
                Tours & Bookings
              </div>
              <Link
                to="/businesses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <Building2 size={15} className="text-[#002D62]" />
                <span>Businesses</span>
              </Link>
              <Link
                to="/bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <CalendarCheck size={15} className="text-emerald-500" />
                <span>Bookings</span>
              </Link>
              <Link
                to="/tours"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <Sparkles size={15} className="text-amber-500" />
                <span>Tour Packages</span>
              </Link>
              <Link
                to="/guides"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <UserCheck size={15} className="text-emerald-600" />
                <span>Tour Guides</span>
              </Link>
            </div>

            {/* Destinations */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-[#002D62] dark:text-blue-400 tracking-wider px-3 mb-1">
                Destinations
              </div>
              <Link
                to="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <Tags size={15} className="text-purple-500" />
                <span>Categories</span>
              </Link>
              <Link
                to="/destinations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <MapPin size={15} className="text-rose-500" />
                <span>Places</span>
              </Link>
              <Link
                to="/provinces"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <Globe size={15} className="text-blue-500" />
                <span>Provinces</span>
              </Link>
              <Link
                to="/galleries"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <Images size={15} className="text-indigo-500" />
                <span>Galleries</span>
              </Link>
              <Link
                to="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <CalendarDays size={15} className="text-amber-500" />
                <span>Events</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
              <Link
                to="/businesses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Partnership
              </Link>
              <Link
                to="/support"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
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
