import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import tourism_app_icon from "../../assets/images/tourism_app_icon.png";
import {
  LayoutGrid, MapPinned, Tags, Images, CalendarDays,
  Star, Heart, Trash2, Settings, LogOut,
  Users, User, X, FileText, ShieldCheck, Bell, Globe, Building2,
  CalendarCheck, Sparkles, UserCheck, ChevronDown, Compass, Activity
} from "lucide-react";
import LogoutAlert from './LogoutAlert';
import { isFullAdminRole, normalizeRole } from '../../services/authService';
import { useLanguage } from '../../i18n';

/* -------------------------------------------------------------------------- */
/*  Navigation config                                                         */
/*  requires: 'privileged' (full admin roles) | 'super_admin'                 */
/*  match:    extra pathnames that should mark the item as active             */
/* -------------------------------------------------------------------------- */

const NAV_SECTIONS = [
  {
    title: 'Management',
    titleKey: 'sidebar.management',
    items: [
      { name: 'Dashboard', key: 'sidebar.dashboard', icon: LayoutGrid, path: '/dashboard' },
      {
        name: 'Tours & Bookings',
        key: 'sidebar.toursBookings',
        icon: Compass,
        children: [
          { name: 'Businesses', key: 'sidebar.businesses', icon: Building2, path: '/businesses', match: ['/businesses', '/business'], requires: 'privileged' },
          { name: 'Bookings', key: 'sidebar.bookings', icon: CalendarCheck, path: '/bookings' },
          { name: 'Tour Packages', key: 'sidebar.tourPackages', icon: Sparkles, path: '/tours' },
          { name: 'Tour Guides', key: 'sidebar.tourGuides', icon: UserCheck, path: '/guides' },
        ],
      },
      {
        name: 'Destinations',
        key: 'sidebar.destinations',
        icon: MapPinned,
        children: [
          { name: 'Categories', key: 'sidebar.categories', icon: Tags, path: '/categories' },
          { name: 'Places', key: 'sidebar.places', icon: MapPinned, path: '/places', match: ['/places', '/place'] },
          { name: 'Provinces', key: 'sidebar.provinces', icon: Globe, path: '/provinces' },
          { name: 'Galleries', key: 'sidebar.galleries', icon: Images, path: '/galleries' },
          { name: 'Events', key: 'sidebar.events', icon: CalendarDays, path: '/events' },
        ],
      },
    ],
  },
  {
    title: 'Engagement',
    titleKey: 'sidebar.engagement',
    items: [
      {
        name: 'Reviews & Feedback',
        key: 'sidebar.reviewsFeedback',
        icon: Star,
        children: [
          { name: 'Ratings & Reviews', key: 'sidebar.ratingsReviews', icon: Star, path: '/ratings', match: ['/ratings', '/reviews'] },
          { name: 'Favorites', key: 'sidebar.favorites', icon: Heart, path: '/favorites' },
        ],
      },
      { name: 'Notifications', key: 'sidebar.notifications', icon: Bell, path: '/notifications' },
    ],
  },
  {
    title: 'Preferences',
    titleKey: 'sidebar.preferences',
    items: [
      {
        name: 'Administration',
        key: 'sidebar.administration',
        icon: ShieldCheck,
        children: [
          { name: 'Users', key: 'sidebar.users', icon: Users, path: '/users', match: ['/users', '/user'], requires: 'privileged' },
          { name: 'Users Tracking', key: 'sidebar.userTracking', icon: Activity, path: '/tracking-users', requires: 'privileged' },
          { name: 'Security Alerts', key: 'sidebar.securityAlerts', icon: ShieldCheck, path: '/security', requires: 'privileged' },
          { name: 'Deletion Requests', key: 'sidebar.deletionRequests', icon: Trash2, path: '/deletion-requests', requires: 'super_admin' },
        ],
      },
      {
        name: 'Reports & Analytics',
        key: 'sidebar.reportsAnalytics',
        icon: FileText,
        requires: 'privileged',
        children: [
          { name: 'Reports', key: 'sidebar.reports', icon: FileText, path: '/reports', match: ['/reports'] },
        ],
      },
      { name: 'Profile', key: 'sidebar.profile', icon: User, path: '/profile' },
      { name: 'Settings', key: 'sidebar.settings', icon: Settings, path: '/settings', requires: 'privileged' },
      { name: 'Logout', key: 'sidebar.logout', icon: LogOut, action: 'logout' },
    ],
  },
];

const canAccess = (item, perms) => {
  if (!item.requires) return true;
  if (item.requires === 'super_admin') return perms.isSuperAdmin;
  if (item.requires === 'privileged') return perms.isPrivileged;
  return false;
};

// Removes items the role can't see, and drops groups that end up empty.
const filterNav = (items, perms) =>
  items
    .filter((item) => canAccess(item, perms))
    .map((item) => (item.children ? { ...item, children: filterNav(item.children, perms) } : item))
    .filter((item) => !item.children || item.children.length > 0);

const isItemActive = (item, pathname) => {
  if (!item.path) return false;
  const patterns = item.match ?? [item.path];
  return patterns.some((p) => pathname === p || pathname.startsWith(`${p}/`));
};

const getDisplayRole = (normRole) => {
  switch (normRole) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Admin';
    case 'guide_editor':
    case 'tourism_content_editor': return 'Tourism Content Editor';
    case 'business_owner': return 'Business Owner';
    default: return 'User';
  }
};

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

function useStoredUser() {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    const sync = () => setUser(readStoredUser());
    // 'storage' fires for other tabs; the custom event covers same-tab updates.
    window.addEventListener('storage', sync);
    window.addEventListener('user-profile-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('user-profile-updated', sync);
    };
  }, []);

  return user;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/* -------------------------------------------------------------------------- */
/*  Flyout: tooltip / submenu rendered in a portal so overflow can't clip it  */
/*  NOTE: it renders into document.body, so your `dark` class must be on      */
/*  <html> (or <body>) for dark: styles to apply inside the portal.           */
/* -------------------------------------------------------------------------- */

const PORTAL_ATTR = 'data-sidebar-portal';

function Flyout({ enabled, interactive = false, panel, className = '', children }) {
  const ref = useRef(null);
  const timer = useRef(null);
  const [rect, setRect] = useState(null);
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const active = enabled && isDesktop;

  const open = () => {
    if (!active) return;
    clearTimeout(timer.current);
    const r = ref.current?.getBoundingClientRect();
    if (r) setRect(r);
  };
  const close = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setRect(null), 80);
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { setRect(null); }, [pathname, active]);

  // Keep position correct if the sidebar scrolls while a flyout is open.
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
    ? interactive
      ? {
        position: 'fixed',
        top: rect.top,
        left: rect.right,
        paddingLeft: 12, // invisible bridge so the pointer can travel to the panel
        maxHeight: `calc(100vh - ${rect.top}px - 8px)`,
      }
      : {
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
      {active && rect &&
        createPortal(
          <div
            {...{ [PORTAL_ATTR]: '' }}
            style={style}
            className={`z-50 ${interactive ? 'overflow-y-auto' : 'pointer-events-none'}`}
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

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                               */
/* -------------------------------------------------------------------------- */

const labelClass = (isExpanded, maxW = 'max-w-[160px]') =>
  `text-sm whitespace-nowrap transition-all duration-200 ${isExpanded
    ? `ml-3 opacity-100 ${maxW}`
    : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden md:ml-0'
  }`;

function SubLink({ child, active }) {
  const { t } = useLanguage();
  const ChildIcon = child.icon;
  const label = child.key ? t(child.key, child.name) : child.name;

  return (
    <Link
      to={child.path}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors duration-150 ${active
        ? 'bg-blue-50 dark:bg-blue-600/15 text-[#003E83] dark:text-blue-400 font-semibold'
        : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-zinc-800/60'
        }`}
    >
      {ChildIcon ? (
        <ChildIcon
          size={14}
          aria-hidden="true"
          className={`shrink-0 ${active ? 'text-[#003E83] dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${active ? 'bg-[#003E83] dark:bg-blue-400' : 'bg-gray-300 dark:bg-zinc-600'
            }`}
        />
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavLeaf({ item, active, isExpanded }) {
  const { t } = useLanguage();
  const Icon = item.icon;
  const label = item.key ? t(item.key, item.name) : item.name;

  return (
    <Flyout
      enabled={!isExpanded}
      className="my-0.5"
      panel={<TooltipBubble>{label}</TooltipBubble>}
    >
      <Link
        to={item.path || '#'}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-150 ${active
          ? 'bg-blue-50 dark:bg-blue-600/15 text-[#003E83] dark:text-blue-400 font-semibold shadow-xs'
          : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/70'
          }`}
      >
        <div className="flex items-center w-full min-w-0">
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            <Icon size={18} aria-hidden="true" />
          </div>
          <span className={labelClass(isExpanded)}>{label}</span>
        </div>
      </Link>
    </Flyout>
  );
}

function LogoutButton({ item, isExpanded, onClick }) {
  const { t } = useLanguage();
  const Icon = item.icon;
  const label = item.key ? t(item.key, item.name) : item.name;

  return (
    <Flyout
      enabled={!isExpanded}
      className="my-0.5"
      panel={<TooltipBubble>{label}</TooltipBubble>}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="flex items-center w-full px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-150 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300"
      >
        <div className="flex items-center w-full min-w-0">
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            <Icon size={18} aria-hidden="true" />
          </div>
          <span className={`${labelClass(isExpanded)} font-medium`}>{label}</span>
        </div>
      </button>
    </Flyout>
  );
}

function NavGroup({ item, pathname, isExpanded, isMenuOpen, onToggle, onExpandAndOpen }) {
  const { t } = useLanguage();
  const Icon = item.icon;
  const label = item.key ? t(item.key, item.name) : item.name;
  const isChildActive = item.children.some((c) => isItemActive(c, pathname));

  return (
    <Flyout
      enabled={!isExpanded}
      interactive
      className="flex flex-col my-0.5"
      panel={
        <div className="w-48 py-2 px-1.5 rounded-lg shadow-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200">
          <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/80 mb-1">
            {label}
          </div>
          <div className="flex flex-col space-y-0.5">
            {item.children.map((child) => (
              <SubLink key={child.name} child={child} active={isItemActive(child, pathname)} />
            ))}
          </div>
        </div>
      }
    >
      <button
        type="button"
        onClick={() => (isExpanded ? onToggle(item.name) : onExpandAndOpen(item.name))}
        aria-label={label}
        aria-expanded={isExpanded ? isMenuOpen : undefined}
        aria-haspopup={isExpanded ? undefined : 'menu'}
        className={`flex items-center justify-between w-full px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-150 ${isChildActive
          ? 'bg-blue-50/70 dark:bg-blue-600/15 text-[#003E83] dark:text-blue-400 font-semibold'
          : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/70'
          }`}
      >
        <div className="flex items-center min-w-0">
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            <Icon size={18} aria-hidden="true" />
          </div>
          <span className={`${labelClass(isExpanded, 'max-w-[130px]')} ${isExpanded ? 'truncate' : ''}`}>
            {label}
          </span>
        </div>

        <div
          className={`transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-100 md:opacity-0 md:w-0 md:overflow-hidden'
            }`}
        >
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`transition-transform duration-200 shrink-0 ${isMenuOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
              }`}
          />
        </div>
      </button>

      {/* Accordion (expanded mode). `invisible` removes closed links from the tab order. */}
      {isExpanded && (
        <div
          className={`grid transition-all duration-200 ease-in-out ${isMenuOpen
            ? 'grid-rows-[1fr] opacity-100 my-0.5 visible'
            : 'grid-rows-[0fr] opacity-0 pointer-events-none invisible'
            }`}
        >
          <div className="overflow-hidden pl-3 ml-4.5 border-l border-gray-200 dark:border-zinc-800 flex flex-col space-y-0.5">
            {item.children.map((child) => (
              <SubLink key={child.name} child={child} active={isItemActive(child, pathname)} />
            ))}
          </div>
        </div>
      )}
    </Flyout>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

export default function Sidebar({ isOpen, setIsOpen, isExpanded, setIsExpanded }) {
  const { t } = useLanguage();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const sidebarRef = useRef(null);
  const { pathname } = useLocation();
  const user = useStoredUser();

  // Least-privilege default: a missing role never shows admin-only items.
  const rawRole = user?.role || 'guest';
  const normRole = normalizeRole(rawRole);
  const isPrivileged = isFullAdminRole(rawRole);
  const isSuperAdmin = normRole === 'super_admin';
  const displayRole = getDisplayRole(normRole);

  const sections = useMemo(
    () =>
      NAV_SECTIONS.map((s) => ({ ...s, items: filterNav(s.items, { isPrivileged, isSuperAdmin }) }))
        .filter((s) => s.items.length > 0),
    [isPrivileged, isSuperAdmin]
  );

  // Close on outside pointer-down (ignores the portal flyouts).
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

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Keep the parent group open when a child route is active.
  useEffect(() => {
    sections.forEach((section) =>
      section.items.forEach((item) => {
        if (item.children?.some((c) => isItemActive(c, pathname))) {
          setOpenMenus((prev) => (prev[item.name] ? prev : { ...prev, [item.name]: true }));
        }
      })
    );
  }, [pathname, sections]);

  const toggleMenu = useCallback((name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const expandAndOpen = useCallback(
    (name) => {
      setIsExpanded?.(true);
      setOpenMenus((prev) => ({ ...prev, [name]: true }));
    },
    [setIsExpanded]
  );

  const userName = user?.name || 'Administrator';
  const userAvatar = user?.avatar || null;

  const renderItem = (item) => {
    if (item.action === 'logout') {
      return (
        <LogoutButton
          key={item.name}
          item={item}
          isExpanded={isExpanded}
          onClick={() => setShowLogoutAlert(true)}
        />
      );
    }
    if (item.children) {
      return (
        <NavGroup
          key={item.name}
          item={item}
          pathname={pathname}
          isExpanded={isExpanded}
          isMenuOpen={!!openMenus[item.name]}
          onToggle={toggleMenu}
          onExpandAndOpen={expandAndOpen}
        />
      );
    }
    return (
      <NavLeaf
        key={item.name}
        item={item}
        active={isItemActive(item, pathname)}
        isExpanded={isExpanded}
      />
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 z-40 transition-all duration-200 flex flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${isExpanded ? 'w-56' : 'w-56 md:w-18'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 overflow-hidden shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
          <div className="flex items-center gap-2.5 w-full min-w-0">
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700 transition-colors">
              <img src={tourism_app_icon} alt="AngkorVerses" className="w-7 h-7 object-contain" />
            </div>
            <div
              className={`flex flex-col whitespace-nowrap transition-all duration-200 ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden'
                }`}
            >
              <span className="font-bold text-sm leading-tight text-gray-900 dark:text-white">{t('common.appName', 'AngkorVerses')}</span>
              <span className="text-[10px] font-normal text-gray-500 dark:text-zinc-400">{t('common.adminPortal', 'Admin Portal')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-md transition-colors shrink-0 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-4"
        >
          {sections.map((section) => (
            <div key={section.title}>
              <h3
                className={`px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 transition-colors ${isExpanded ? 'opacity-100 mb-1' : 'opacity-100 md:opacity-0 md:h-0 md:overflow-hidden'
                  }`}
              >
                {section.titleKey ? t(section.titleKey, section.title) : section.title}
              </h3>
              <div className="flex flex-col">{section.items.map(renderItem)}</div>
            </div>
          ))}
        </nav>

        {/* Profile Card */}
        <div className="h-14 px-2.5 shrink-0 flex items-center border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
          <Flyout
            enabled={!isExpanded}
            className="w-full"
            panel={
              <TooltipBubble>
                {userName} ({displayRole})
              </TooltipBubble>
            }
          >
            <Link
              to="/profile"
              aria-label="User Profile"
              className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors overflow-hidden"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-zinc-700">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <div
                className={`flex flex-col min-w-0 transition-all duration-200 ${isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden'
                  }`}
              >
                <span className="text-xs font-medium truncate text-gray-900 dark:text-zinc-100">{userName}</span>
                <span className="text-[10px] truncate text-gray-500 dark:text-zinc-400">{displayRole}</span>
              </div>
            </Link>
          </Flyout>
        </div>
      </aside>

      <LogoutAlert
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
      />
    </>
  );
}
