import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import tourism_app_icon from '../../assets/images/tourism_app_icon.png';
import {
  LayoutDashboard,
  Store,
  Package,
  CalendarCheck,
  Clock,
  Star,
  FileText,
  Bell,
  Settings,
  LogOut,
  Globe,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import BusinessLogoutAlert from './BusinessLogoutAlert';
import { useAuth } from '../../context/AuthContext';

const NAV_SECTIONS = [
  {
    title: 'Management',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/business/dashboard' },
      { name: 'Business Profile', icon: Store, path: '/business/profile' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Listings & Services', icon: Package, path: '/business/listings' },
      { name: 'Bookings', icon: CalendarCheck, path: '/business/bookings' },
      { name: 'Operating Hours', icon: Clock, path: '/business/availability' },
    ],
  },
  {
    title: 'Engagement & Analytics',
    items: [
      { name: 'Customer Reviews', icon: Star, path: '/business/reviews' },
      { name: 'Sales & Reports', icon: FileText, path: '/business/reports' },
      { name: 'Notifications', icon: Bell, path: '/business/notifications' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { name: 'Settings', icon: Settings, path: '/business/settings' },
      { name: 'Logout', icon: LogOut, action: 'logout' },
    ],
  },
];

const isItemActive = (item, pathname) => {
  if (!item.path) return false;
  if (item.path === '/business/dashboard') return pathname === '/business/dashboard';
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

function useMediaQuery(query) {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false
  );
}

const PORTAL_ATTR = 'data-business-sidebar-portal';

function Flyout({ enabled, panel, className = '', children }) {
  const ref = useRef(null);
  const timer = useRef(null);
  const [rect, setRect] = useState(null);
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const active = enabled && isDesktop;

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (rect) setRect(null);
  }

  const open = () => {
    if (!active) return;
    clearTimeout(timer.current);
    const r = ref.current?.getBoundingClientRect();
    if (r) setRect(r);
  };
  const close = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setRect(null), 180);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!rect) return;
    const hide = () => setRect(null);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [rect]);

  const style = rect
    ? {
        position: 'fixed',
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
        transform: 'translateY(-50%)',
      }
    : undefined;

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {active &&
        rect &&
        createPortal(
          <div
            {...{ [PORTAL_ATTR]: '' }}
            style={style}
            onMouseEnter={open}
            onMouseLeave={close}
            className="z-50 pointer-events-none"
          >
            {panel}
          </div>,
          document.body
        )}
    </div>
  );
}

const TooltipBubble = ({ children }) => (
  <div className="px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shadow-md bg-gray-900 dark:bg-zinc-950 border border-gray-800 dark:border-zinc-800 text-white">
    {children}
  </div>
);

const labelClass = (isExpanded, maxW = 'max-w-[160px]') =>
  `text-sm whitespace-nowrap transition-all duration-200 ${
    isExpanded
      ? `ml-3 opacity-100 ${maxW}`
      : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden md:ml-0'
  }`;

export default function BusinessSidebar({
  isOpen,
  setIsOpen,
  isExpanded,
  selectedBusiness,
  businesses = [],
  onSelectBusiness,
}) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const sidebarRef = useRef(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Close on outside click on mobile
  useEffect(() => {
    if (!isOpen) return;
    const handler = (event) => {
      if (event.target.closest?.(`[${PORTAL_ATTR}]`)) return;
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen, setIsOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const userName = user?.name || 'Business Owner';
  const userAvatar = user?.avatar || null;

  const renderItem = (item) => {
    if (item.action === 'logout') {
      const content = (
        <button
          type="button"
          onClick={() => setShowLogoutAlert(true)}
          aria-label={item.name}
          className="flex items-center w-full px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-150 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300"
        >
          <div className="flex items-center w-full min-w-0">
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              <LogOut size={18} aria-hidden="true" />
            </div>
            <span className={`${labelClass(isExpanded)} font-medium`}>{item.name}</span>
          </div>
        </button>
      );

      if (isExpanded) {
        return <div key={item.name} className="my-0.5">{content}</div>;
      }

      return (
        <Flyout
          key={item.name}
          enabled={!isExpanded}
          className="my-0.5"
          panel={<TooltipBubble>{item.name}</TooltipBubble>}
        >
          {content}
        </Flyout>
      );
    }

    const active = isItemActive(item, pathname);
    const Icon = item.icon;

    const content = (
      <Link
        to={item.path || '#'}
        aria-label={item.name}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-150 ${
          active
            ? 'bg-blue-50 dark:bg-blue-600/15 text-[#003E83] dark:text-blue-400 font-semibold shadow-xs'
            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/70'
        }`}
      >
        <div className="flex items-center w-full min-w-0">
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            <Icon size={18} aria-hidden="true" />
          </div>
          <span className={labelClass(isExpanded)}>{item.name}</span>
        </div>
      </Link>
    );

    if (isExpanded) {
      return <div key={item.name} className="my-0.5">{content}</div>;
    }

    return (
      <Flyout
        key={item.name}
        enabled={!isExpanded}
        className="my-0.5"
        panel={<TooltipBubble>{item.name}</TooltipBubble>}
      >
        {content}
      </Flyout>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Main Sidebar Element */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 z-40 transition-all duration-200 flex flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isExpanded ? 'w-56' : 'w-56 md:w-18'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 overflow-hidden shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
          <Link to="/business/dashboard" className="flex items-center gap-2.5 w-full min-w-0">
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700 transition-colors">
              <img src={tourism_app_icon} alt="AngkorVerses" className="w-7 h-7 object-contain" />
            </div>
            <div
              className={`flex flex-col whitespace-nowrap transition-all duration-200 ${
                isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden'
              }`}
            >
              <span className="font-bold text-sm leading-tight text-gray-900 dark:text-white">
                AngkorVerses
              </span>
              <span className="text-[10px] font-normal text-gray-500 dark:text-zinc-400">
                Business Hub
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-md transition-colors shrink-0 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav
          aria-label="Main business navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-4"
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3
                className={`px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 transition-colors ${
                  isExpanded ? 'opacity-100 mb-1' : 'opacity-100 md:opacity-0 md:h-0 md:overflow-hidden'
                }`}
              >
                {section.title}
              </h3>
              <div className="flex flex-col">{section.items.map(renderItem)}</div>
            </div>
          ))}
        </nav>

        {/* Switch to Tourist View Shortcut */}
        <div className="px-2 py-2 border-t border-gray-200 dark:border-zinc-800">
          {isExpanded ? (
            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/70 transition"
              title="Switch to Tourist Client View"
            >
              <Globe size={16} className="text-blue-500 shrink-0" />
              <span className="truncate">Tourist Client View</span>
            </Link>
          ) : (
            <Flyout
              enabled={!isExpanded}
              panel={<TooltipBubble>Tourist Client View</TooltipBubble>}
            >
              <Link
                to="/"
                className="flex items-center justify-center w-full py-1.5 rounded-md text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                aria-label="Tourist Client View"
              >
                <Globe size={18} className="text-blue-500" />
              </Link>
            </Flyout>
          )}
        </div>

        {/* Profile Card Footer */}
        <div className="h-14 px-2.5 shrink-0 flex items-center border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
          {isExpanded ? (
            <Link
              to="/business/profile"
              aria-label="Business Owner Profile"
              className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors overflow-hidden"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-zinc-700">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col min-w-0 transition-all duration-200 opacity-100 max-w-[140px]">
                <span className="text-xs font-medium truncate text-gray-900 dark:text-zinc-100">
                  {userName}
                </span>
                <span className="text-[10px] truncate text-gray-500 dark:text-zinc-400">
                  Business Owner
                </span>
              </div>
            </Link>
          ) : (
            <Flyout
              enabled={!isExpanded}
              className="w-full"
              panel={
                <TooltipBubble>
                  {userName} (Business Owner)
                </TooltipBubble>
              }
            >
              <Link
                to="/business/profile"
                aria-label="Business Owner Profile"
                className="w-full flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors overflow-hidden"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-zinc-700">
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
            </Flyout>
          )}
        </div>
      </aside>

      {/* Logout Alert Modal */}
      <BusinessLogoutAlert
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
      />
    </>
  );
}

