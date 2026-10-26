import { Link, useLocation } from 'react-router-dom';
import {
  Hotel,
  Plane,
  Train,
  Car,
  Ticket,
  Luggage,
  UserCheck,
  Users,
  Ship,
  Sparkles,
  Compass,
  Map,
  Tag,
  Coins,
  Smartphone,
  X,
  ChevronRight,
  ShieldCheck,
  Headphones
} from 'lucide-react';

export default function TripSidebar({
  isExpanded = true,
  isMobileOpen = false,
  onCloseMobile = () => {},
  onOpenAppModal = () => {}
}) {
  const location = useLocation();

  const isItemActive = (path, matchParams) => {
    if (!path) return false;
    if (matchParams) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const mainChannels = [
    { name: 'Hotels & Homes', path: '/places', icon: Hotel, badge: null },
    { name: 'Flights', path: '/destinations', icon: Plane, badge: null },
    { name: 'Trains', path: '/trips', icon: Train, badge: null },
    { name: 'Cars', path: '/businesses', icon: Car, badge: null },
    { name: 'Attractions & Tours', path: '/tours', icon: Ticket, badge: null },
    { name: 'Flight + Hotel', path: '/tours?bundle=true', icon: Luggage, badge: null, matchParams: true },
  ];

  const tourChannels = [
    { name: 'Private Tours', path: '/tours?category=private', icon: UserCheck, badge: null, matchParams: true },
    { name: 'Group Tours', path: '/tours?category=group', icon: Users, badge: null, matchParams: true },
    { name: 'Cruises', path: '/places?category=island', icon: Ship, badge: null, matchParams: true },
  ];

  const exploreChannels = [
    { name: 'Trip.Planner', path: '/trips', icon: Sparkles, badge: 'New', badgeColor: 'bg-rose-500' },
    { name: 'Travel Inspiration', path: '/provinces', icon: Compass, badge: null },
    { name: 'Map', path: '/places', icon: Map, badge: null },
    { name: 'Deals', path: '/events', icon: Tag, badge: null },
  ];

  const loyaltyChannels = [
    { name: 'Trip Rewards', path: '/achievements', icon: Coins, badge: '5% Back', badgeColor: 'bg-amber-500' },
    {
      name: 'App',
      action: onOpenAppModal,
      icon: Smartphone,
      badge: 'Free',
      badgeColor: 'bg-blue-600'
    },
  ];

  const renderNavGroup = (items) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.path ? isItemActive(item.path, item.matchParams) : false;

        const content = (
          <div
            className={`group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              active
                ? 'bg-blue-50/90 dark:bg-blue-950/60 text-[#287dfa] dark:text-blue-400 font-bold shadow-xs'
                : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 hover:text-[#287dfa] dark:hover:text-blue-400'
            }`}
            title={!isExpanded ? item.name : undefined}
          >
            <div
              className={`w-6 h-6 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                active ? 'text-[#287dfa] dark:text-blue-400' : 'text-gray-500 dark:text-zinc-400'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
            </div>

            {isExpanded && (
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="truncate tracking-tight text-[13px]">{item.name}</span>
                {item.badge && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full text-white shrink-0 ${
                      item.badgeColor || 'bg-rose-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            )}

            {/* Tooltip when collapsed */}
            {!isExpanded && (
              <div className="absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                {item.name}
              </div>
            )}
          </div>
        );

        return (
          <li key={item.name}>
            {item.action ? (
              <button
                type="button"
                onClick={() => {
                  item.action();
                  onCloseMobile();
                }}
                className="w-full text-left"
              >
                {content}
              </button>
            ) : (
              <Link to={item.path} onClick={onCloseMobile}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white dark:bg-zinc-900 border-r border-gray-200/90 dark:border-zinc-800 transition-all duration-300 ease-in-out flex flex-col ${
          // Desktop sizing
          isExpanded ? 'lg:w-56' : 'lg:w-[72px]'
        } ${
          // Mobile responsive slide-over
          isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-[#0f294d] dark:text-white">
              Trip<span className="text-[#287dfa]">.com</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              Cambodia
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Channels List Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 scrollbar-thin">
          {renderNavGroup(mainChannels)}

          <div className="my-2 border-t border-gray-100 dark:border-zinc-800/80" />

          {renderNavGroup(tourChannels)}

          <div className="my-2 border-t border-gray-100 dark:border-zinc-800/80" />

          {renderNavGroup(exploreChannels)}

          <div className="my-2 border-t border-gray-100 dark:border-zinc-800/80" />

          {renderNavGroup(loyaltyChannels)}
        </div>

        {/* Bottom Trust & Support Badge (visible when expanded) */}
        {isExpanded && (
          <div className="p-3 m-2.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-sky-50/50 dark:from-zinc-800/70 dark:to-zinc-800/30 border border-blue-100/80 dark:border-zinc-700/60 hidden lg:block">
            <div className="flex items-center gap-2 text-[#0f294d] dark:text-white mb-1">
              <ShieldCheck size={16} className="text-[#287dfa]" />
              <span className="text-xs font-bold">24/7 Trip Guarantee</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-tight">
              Direct local booking, verified guest reviews & instant support.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
