import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CalendarCheck, Sparkles, MapPinned,
  UserCheck, Building2, ShieldCheck, ArrowRight,
  Tags, Globe, Images, CalendarDays, Star, Heart,
  Bell, FileText, Users, Trash2, Settings, User
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import UserGrowthChart from './UserGrowthChart';
import TopPlaces from './TopPlaces';
import CategoryDistribution from './CategoryDistribution';
import RecentBookings from './RecentBookings';
import RecentActivity from './RecentActivity';
import dashboardService from '../../services/dashboardService';
import { getPageCache, setPageCache } from '../../utils/pageCache';
import { useLanguage } from '../../i18n';
import authService, { isFullAdminRole, isSuperAdminRole } from '../../services/authService';

export default function Dashboard() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('yearly');
  const cachedDash = getPageCache('dashboard_stats_yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(() => cachedDash || null);
  const [cache, setCache] = useState(() => cachedDash ? { yearly: cachedDash } : {});

  const fetchStats = async (range = timeRange) => {
    const existing = cache[range] || getPageCache('dashboard_stats_' + range);
    if (!existing) {
      setIsLoading(true);
    } else {
      setDashboardData(existing);
    }
    try {
      const res = await dashboardService.getStats(range);
      if (res && res.success && res.data) {
        setCache((prev) => ({
          ...prev,
          [range]: res.data,
        }));
        setPageCache('dashboard_stats_' + range, res.data);
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats from API', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange]);

  const pendingVerifications = dashboardData?.stats?.pending_verifications || 0;
  const pendingBookings = dashboardData?.stats?.pending_bookings || 0;
  const role = authService.getCurrentUser()?.role;
  const isPrivileged = isFullAdminRole(role);
  const isSuperAdmin = isSuperAdminRole(role);

  // Comprehensive System Shortcuts - All 18 modules
  const allShortcuts = [
    { name: 'Bookings Queue', nameKey: 'dashboard.scBookings', path: '/bookings', icon: CalendarCheck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', desc: 'Process reservations', descKey: 'dashboard.scBookingsDesc' },
    { name: 'Tour Packages', nameKey: 'dashboard.scTourPackages', path: '/tours', icon: Sparkles, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', desc: 'Tour itineraries', descKey: 'dashboard.scTourPackagesDesc' },
    { name: 'Tour Guides', nameKey: 'dashboard.scTourGuides', path: '/guides', icon: UserCheck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', desc: 'Certified guides', descKey: 'dashboard.scTourGuidesDesc' },
    { name: 'Destinations', nameKey: 'dashboard.scDestinations', path: '/place', icon: MapPinned, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40', desc: 'Heritage attractions', descKey: 'dashboard.scDestinationsDesc' },
    { name: 'Categories', nameKey: 'dashboard.scCategories', path: '/categories', icon: Tags, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40', desc: 'Destination types', descKey: 'dashboard.scCategoriesDesc' },
    { name: 'Provinces', nameKey: 'dashboard.scProvinces', path: '/provinces', icon: Globe, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40', desc: 'Tourism regions', descKey: 'dashboard.scProvincesDesc' },
    { name: 'Galleries', nameKey: 'dashboard.scGalleries', path: '/galleries', icon: Images, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', desc: 'Photos & media', descKey: 'dashboard.scGalleriesDesc' },
    { name: 'Events', nameKey: 'dashboard.scEvents', path: '/events', icon: CalendarDays, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', desc: 'Festivals schedule', descKey: 'dashboard.scEventsDesc' },
    { name: 'Businesses', nameKey: 'dashboard.scBusinesses', path: '/businesses', requires: 'privileged', icon: Building2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', desc: 'Commercial partners', descKey: 'dashboard.scBusinessesDesc' },
    { name: 'Ratings & Reviews', nameKey: 'dashboard.scRatingsReviews', path: '/ratings', icon: Star, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40', desc: 'Traveler feedback', descKey: 'dashboard.scRatingsReviewsDesc' },
    { name: 'Saved Favorites', nameKey: 'dashboard.scSavedFavorites', path: '/favorites', icon: Heart, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/40', desc: 'Wishlist items', descKey: 'dashboard.scSavedFavoritesDesc' },
    { name: 'Notifications', nameKey: 'dashboard.scNotifications', path: '/notifications', icon: Bell, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40', desc: 'System alerts', descKey: 'dashboard.scNotificationsDesc' },
    { name: 'Reports', nameKey: 'dashboard.scReports', path: '/reports', requires: 'privileged', icon: FileText, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-zinc-800', desc: 'Analytics & exports', descKey: 'dashboard.scReportsDesc' },
    { name: 'Users', nameKey: 'dashboard.scUsers', path: '/users', requires: 'privileged', icon: Users, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/40', desc: 'Accounts & roles', descKey: 'dashboard.scUsersDesc' },
    { name: 'Security Alerts', nameKey: 'dashboard.scSecurity', path: '/security', requires: 'privileged', icon: ShieldCheck, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', desc: 'System protections', descKey: 'dashboard.scSecurityDesc' },
    { name: 'Deletion Requests', nameKey: 'dashboard.scDeletion', path: '/deletion-requests', requires: 'super_admin', icon: Trash2, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', desc: 'Account removals', descKey: 'dashboard.scDeletionDesc' },
    { name: 'Settings', nameKey: 'dashboard.scSettings', path: '/settings', requires: 'privileged', icon: Settings, color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800', desc: 'System settings', descKey: 'dashboard.scSettingsDesc' },
    { name: 'Profile', nameKey: 'dashboard.scProfile', path: '/profile', icon: User, color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', desc: 'Admin account', descKey: 'dashboard.scProfileDesc' },
  ];

  const visibleShortcuts = allShortcuts.filter((item) => (
    !item.requires ||
    (item.requires === 'privileged' && isPrivileged) ||
    (item.requires === 'super_admin' && isSuperAdmin)
  ));

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Header with Timeframe filter & Live status (Refresh button removed) */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        canViewReports={isPrivileged}
      />

      {/* 2. Urgent Attention Banner (Pending Bookings & Verifications) */}
      {(pendingVerifications > 0 || pendingBookings > 0) && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {t('dashboard.actionRequired', 'Action Required in Tourism System')}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                {t('dashboard.youHave', 'You have')}{' '}
                {pendingBookings > 0 && <strong>{t('dashboard.pendingBookingsCount', '{count} pending booking(s)').replace('{count}', pendingBookings)}</strong>}
                {pendingBookings > 0 && pendingVerifications > 0 && t('dashboard.andText', ' and ')}
                {pendingVerifications > 0 && <strong>{t('dashboard.verificationRequestsCount', '{count} verification request(s)').replace('{count}', pendingVerifications)}</strong>}{' '}
                {t('dashboard.requiringAttention', 'requiring administrator attention.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pendingBookings > 0 && (
              <Link
                to="/bookings"
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1"
              >
                <span>{t('dashboard.reviewBookingsBtn', 'Review Bookings ({count})').replace('{count}', pendingBookings)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {isPrivileged && pendingVerifications > 0 && (
              <Link
                to="/businesses"
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 transition-colors flex items-center gap-1"
              >
                <span>{t('dashboard.verifyRequestsBtn', 'Verify Requests ({count})').replace('{count}', pendingVerifications)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. Primary System KPIs & Operational Metrics (Front & Center) */}
      <div>
        <DashboardStats
          apiStats={dashboardData?.stats}
          timeRange={timeRange}
        />
      </div>

      {/* 4. Traveler Growth & Engagement Chart (Full Width) */}
      <div>
        <UserGrowthChart
          growthData={dashboardData?.user_growth}
          timeRange={timeRange}
          isLoading={isLoading}
        />
      </div>

      {/* 5. Destination Analytics: Top Places & Category Distribution (Under User Growth) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations by Rating & Engagement */}
        <TopPlaces
          places={dashboardData?.top_places}
          topPlaces={dashboardData?.top_places}
          timeRange={timeRange}
          isLoading={isLoading}
        />

        {/* Category Distribution Donut Chart */}
        <CategoryDistribution
          distribution={dashboardData?.category_distribution}
          userStatus={dashboardData?.user_status}
          timeRange={timeRange}
          isLoading={isLoading}
        />
      </div>

      {/* 6. Live Operations: Recent Bookings Queue & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings Queue */}
        <RecentBookings
          bookings={dashboardData?.recent_bookings}
          isLoading={isLoading}
        />

        {/* Live System Activity Feed */}
        <RecentActivity
          activities={dashboardData?.recent_activity}
          recentPlaces={dashboardData?.recent_places}
        />
      </div>

      {/* 7. Quick Management Shortcuts - ALL SYSTEM MODULES */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('dashboard.shortcutsTitle', 'Quick Management Shortcuts')}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
                {t('dashboard.shortcutsBadge', '{count} Modules').replace('{count}', visibleShortcuts.length)}
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('dashboard.shortcutsDescription', 'Direct 1-click access to all modules and configurations across the platform')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {visibleShortcuts.map((item) => {
            const Icon = item.icon;
            const title = t(item.nameKey, item.name);
            const description = t(item.descKey, item.desc);
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col p-3 rounded-md border border-gray-100 dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50/40 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800/80 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-md ${item.bg} ${item.color} shrink-0 transition-transform group-hover:scale-105`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                    {description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
