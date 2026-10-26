import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  BarChart3, 
  FileSpreadsheet, 
  Compass, 
  Calendar, 
  Image as ImageIcon, 
  MessageSquare, 
  PhoneCall, 
  PlusCircle, 
  LogOut, 
  Globe, 
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import logoImg from '../../assets/tourism_logo.png';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { showConfirm } = useAlert();

  const normRole = String(role || user?.role || 'user').toLowerCase().trim().replace(/[\s/-]+/g, '_');
  const isGuide = ['tour_guide', 'guide_editor', 'content_editor', 'guide'].includes(normRole);
  const isAdmin = ['admin', 'super_admin', 'superadmin', 'administrator', 'manager'].includes(normRole);

  // Business Owner Menu Links
  const businessLinks = [
    { name: 'Dashboard', path: '/business/dashboard', icon: LayoutDashboard },
    { name: 'My Businesses', path: '/business/businesses', icon: Building2 },
    { name: 'Register Business', path: '/business/businesses/new', icon: PlusCircle },
    { name: 'Reservations', path: '/business/bookings', icon: CalendarCheck },
    { name: 'Analytics', path: '/business/analytics', icon: BarChart3 },
    { name: 'Reports & Export', path: '/business/reports', icon: FileSpreadsheet },
  ];

  // Tour Guide & Content Editor Menu Links
  const guideLinks = [
    { name: 'Guide Dashboard', path: '/guide/dashboard', icon: LayoutDashboard },
    { name: 'My Places & Attractions', path: '/guide/places', icon: Compass },
    { name: 'Create Place', path: '/guide/places/new', icon: PlusCircle },
    { name: 'Events & Festivals', path: '/guide/events', icon: Calendar },
    { name: 'Media Gallery', path: '/guide/gallery', icon: ImageIcon },
    { name: 'Traveler Reviews', path: '/guide/reviews', icon: MessageSquare },
    { name: 'Traveler Inquiries', path: '/guide/inquiries', icon: PhoneCall },
  ];

  // Admin / General Management Links
  const adminLinks = [
    { name: 'Management Hub', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Business Portal', path: '/business/businesses', icon: Building2 },
    { name: 'Reservations', path: '/business/bookings', icon: CalendarCheck },
    { name: 'Places Directory', path: '/guide/places', icon: Compass },
    { name: 'Events Calendar', path: '/guide/events', icon: Calendar },
    { name: 'Analytics', path: '/business/analytics', icon: BarChart3 },
    { name: 'Reports & Export', path: '/business/reports', icon: FileSpreadsheet },
  ];

  let menuItems = businessLinks;
  let roleTitle = 'Business Portal';
  if (isGuide) {
    menuItems = guideLinks;
    roleTitle = 'Tour Guide Portal';
  } else if (isAdmin) {
    menuItems = adminLinks;
    roleTitle = 'Admin Management';
  }

  const handleLogout = () => {
    showConfirm('Are you sure you want to sign out of your management session?', async () => {
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-gray-200/80 dark:border-zinc-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="h-18 px-6 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003E83]/10 dark:bg-blue-900/30 p-1.5 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40">
                <img src={logoImg} alt="AngkorVerses Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight block">
                  AngkorVerses
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003E83] dark:text-blue-400 block">
                  {roleTitle}
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Role Status Tag */}
          <div className="px-5 pt-4 pb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-zinc-900 border border-blue-100/70 dark:border-blue-900/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#003E83] text-white flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Active Role
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white capitalize truncate block">
                  {normRole.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Management Menu
            </span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/business/dashboard' && item.path !== '/guide/dashboard' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#003E83] text-white shadow-md shadow-blue-900/20'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-70" />}
                </Link>
              );
            })}

            {/* Cross Links to Other Relevant Sections */}
            <div className="pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800/80">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Public Tourist Experience
              </span>
              <Link
                to="/tours"
                onClick={onClose}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-950/50 transition-all border border-blue-100 dark:border-blue-900/30"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={16} />
                  <span>Public Tours & Packages</span>
                </div>
                <ExternalLink size={13} />
              </Link>
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 transition-all border border-emerald-100 dark:border-emerald-900/30"
              >
                <div className="flex items-center gap-3">
                  <Globe size={16} />
                  <span>Browse Travel Frontend</span>
                </div>
                <ExternalLink size={13} />
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Manager')}&background=003E83&color=fff`}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-white dark:ring-zinc-800"
              />
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                  {user?.name || 'Management User'}
                </span>
                <span className="text-[11px] text-gray-400 truncate block">
                  {user?.email || 'manager@tourism.com'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
