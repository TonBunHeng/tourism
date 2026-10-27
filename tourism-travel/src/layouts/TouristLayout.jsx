import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Heart, 
  Calendar, 
  User, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  Briefcase, 
  PhoneCall, 
  MapPin, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleTheme, isDarkTheme, getInitialTheme } from '../utils/Theme';
import notificationService from '../services/notificationService';
import logoImg from '../assets/images/tourism_logo.png';

export default function TouristLayout() {
  const { user, isAuthenticated, logout, isBusinessOwner } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(getInitialTheme());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getUnreadCount()
        .then((res) => {
          if (res?.success && typeof res.data?.unread_count === 'number') {
            setUnreadCount(res.data.unread_count);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleToggleTheme = () => {
    const next = toggleTheme(theme);
    setTheme(next);
  };

  const navLinks = [
    { label: 'Explore', path: '/' },
    { label: 'Destinations', path: '/destinations' },
    { label: 'AI Assistant', path: '/ai-chat', icon: Sparkles, badge: 'AI' },
    { label: 'Bookings', path: '/bookings', authRequired: true },
    { label: 'Favorites', path: '/favorites', authRequired: true },
    { label: 'Support & FAQs', path: '/support' },
  ];

  const filteredNavLinks = navLinks.filter(item => !item.authRequired || isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-[#003E83] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide">🇰🇭 Kingdom of Wonder</span>
            <span className="hidden sm:inline text-blue-200">— Official Cambodia Tourism Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-blue-100">
            <span className="flex items-center gap-1">
              <PhoneCall size={12} className="text-amber-300" />
              <span>Tourist Police: <strong>117</strong></span>
            </span>
            {isBusinessOwner && (
              <Link to="/business/dashboard" className="hidden sm:flex items-center gap-1 font-semibold text-amber-300 hover:underline">
                <Briefcase size={12} />
                <span>Go to Business Hub</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoImg} 
              alt="AngkorVerses Logo" 
              className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <div className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#003E83] to-blue-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                AngkorVerses
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-zinc-400">
                Kingdom of Cambodia
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredNavLinks.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#003E83]/10 dark:bg-blue-500/15 text-[#003E83] dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {Icon && <Icon size={15} className="text-amber-500 dark:text-amber-400" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkTheme(theme) ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                  title="Notifications"
                >
                  <Bell size={19} />
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
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#003E83] text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-zinc-200 max-w-[120px] truncate">
                      {user?.name || 'Tourist'}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {/* Profile Dropdown Menu */}
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
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-300">
                          {user?.role || 'Tourist'}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                        >
                          <User size={15} className="text-slate-400" />
                          <span>My Profile & Preferences</span>
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                        >
                          <Calendar size={15} className="text-slate-400" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                        >
                          <Heart size={15} className="text-rose-500" />
                          <span>Saved Wishlist</span>
                        </Link>

                        {isBusinessOwner && (
                          <Link
                            to="/business/dashboard"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition border-t border-slate-100 dark:border-zinc-800"
                          >
                            <Briefcase size={15} />
                            <span>Business Owner Hub</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        >
                          <LogOut size={15} />
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
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#003E83] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#003E83] hover:bg-[#002e62] text-white shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              aria-label="Open mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-3 pb-5 space-y-1">
            {filteredNavLinks.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-[#003E83]/10 text-[#003E83] dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon size={16} className="text-amber-500" />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isBusinessOwner && (
              <Link
                to="/business/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-800"
              >
                <Briefcase size={16} />
                <span>Switch to Business Owner Hub</span>
              </Link>
            )}
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
                <img src={logoImg} alt="AngkorVerses Logo" className="w-8 h-8 object-contain" />
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                  AngkorVerses
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                The premier digital gateway to explore ancient Khmer heritage, vibrant provincial culture, pristine islands, and authentic Cambodian culinary experiences.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-[#003E83] dark:text-blue-400">
                <MapPin size={14} />
                <span>Phnom Penh & Siem Reap, Cambodia</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Discover
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <li><Link to="/destinations?category=1" className="hover:text-[#003E83] dark:hover:text-blue-400">Angkor & Temples</Link></li>
                <li><Link to="/destinations?province=Siem+Reap" className="hover:text-[#003E83] dark:hover:text-blue-400">Siem Reap Provincial Guide</Link></li>
                <li><Link to="/destinations?province=Phnom+Penh" className="hover:text-[#003E83] dark:hover:text-blue-400">Phnom Penh City Life</Link></li>
                <li><Link to="/ai-chat" className="hover:text-[#003E83] dark:hover:text-blue-400">Cambodia AI Travel Assistant</Link></li>
              </ul>
            </div>

            {/* For Business & Guides */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Partners & Directory
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <li><Link to="/register" className="hover:text-[#003E83] dark:hover:text-blue-400">Register as Business Owner</Link></li>
                <li><Link to="/business/dashboard" className="hover:text-[#003E83] dark:hover:text-blue-400">Business Management Hub</Link></li>
                <li><a href="http://localhost:5174" target="_blank" rel="noreferrer" className="hover:text-[#003E83] dark:hover:text-blue-400">Ministry Staff Admin Portal ↗</a></li>
                <li><Link to="/support" className="hover:text-[#003E83] dark:hover:text-blue-400">Help Center & Contact</Link></li>
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
                    <span className="font-mono text-[#003E83] dark:text-blue-400 font-bold">117</span>
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
              © {new Date().getFullYear()} AngkorVerses — Ministry of Tourism, Kingdom of Cambodia. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/support" className="hover:underline">Privacy Policy</Link>
              <Link to="/support" className="hover:underline">Terms of Service</Link>
              <Link to="/support" className="hover:underline">GDPR / Deletion</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
