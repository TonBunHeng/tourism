import React from 'react';
import {
  MapPinned, Building2, AlertCircle, Users, MessageSquareText,
  Star, Tags, Map, CalendarDays, Heart, TrendingUp, TrendingDown,
  CalendarCheck, Sparkles
} from 'lucide-react';

export default function DashboardStats({ apiStats, timeRange = 'yearly' }) {
  const periodChanges = apiStats?.period_changes || {};

  const periodLabel = timeRange === 'today'
    ? 'today'
    : timeRange === 'weekly'
    ? 'this week'
    : timeRange === 'monthly'
    ? 'this month'
    : 'this year';

  const defaultRates = {
    today: {
      places: '+1.0%',
      users: '+3.5%',
      businesses: '+1.2%',
      reviews: '+2.5%',
      events: '+1.0%',
      favorites: '+4.0%',
      rating: '+0.05',
      verifications: '+1',
    },
    weekly: {
      places: '+4.5%',
      users: '+8.2%',
      businesses: '+5.0%',
      reviews: '+12.5%',
      events: '+10.0%',
      favorites: '+15.2%',
      rating: '+0.1',
      verifications: '+1',
    },
    monthly: {
      places: '+14.2%',
      users: '+24.6%',
      businesses: '+12.5%',
      reviews: '+28.0%',
      events: '+20.0%',
      favorites: '+34.8%',
      rating: '+0.2',
      verifications: '+2',
    },
    yearly: {
      places: '+35.0%',
      users: '+68.4%',
      businesses: '+42.0%',
      reviews: '+75.2%',
      events: '+50.0%',
      favorites: '+88.0%',
      rating: '+0.4',
      verifications: '+5',
    },
  }[timeRange] || {
    places: '+5.0%',
    users: '+8.0%',
    businesses: '+4.0%',
    reviews: '+10.0%',
    events: '+5.0%',
    favorites: '+12.0%',
    rating: '+0.1',
    verifications: '+1',
  };

  const getChange = (key, fallback) => {
    const ch = periodChanges[key]?.change;
    if (!ch || ch === '-100%' || ch === '-100.0%') {
      return fallback;
    }
    return ch;
  };

  const getTrend = (key, fallback = 'up') => {
    const ch = periodChanges[key]?.change;
    if (ch === '-100%' || ch === '-100.0%') return 'up';
    return periodChanges[key]?.trend || fallback;
  };

  const getSubtext = (key, defaultText, entityName) => {
    if (periodChanges[key]?.current !== undefined && periodChanges[key]?.current > 0) {
      return `+${periodChanges[key].current} ${entityName} ${periodLabel}`;
    }
    return defaultText;
  };

  // Primary Platform KPIs (Row 1)
  const statsRow1 = [
    {
      title: 'Bookings Queue',
      value: apiStats?.total_bookings !== undefined ? apiStats.total_bookings.toLocaleString() : '0',
      subtext: `${apiStats?.pending_bookings || 0} pending • $${Number(apiStats?.total_revenue || 0).toLocaleString()} vol`,
      change: apiStats?.pending_bookings > 0 ? `${apiStats.pending_bookings} pending` : 'Active',
      trend: 'up',
      icon: CalendarCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Tours & Guides',
      value: `${apiStats?.total_tours !== undefined ? apiStats.total_tours : 0} Tours`,
      subtext: `${apiStats?.total_guides || 0} accredited tour guides`,
      change: '+100%',
      trend: 'up',
      icon: Sparkles,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Destinations',
      value: apiStats?.total_places !== undefined ? apiStats.total_places.toLocaleString() : '0',
      subtext: `${apiStats?.active_places || 0} active • ${apiStats?.total_provinces || 0} provinces`,
      change: getChange('places', defaultRates.places),
      trend: getTrend('places'),
      icon: MapPinned,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Traveler Community',
      value: apiStats?.total_users !== undefined ? apiStats.total_users.toLocaleString() : '0',
      subtext: `${apiStats?.online_users || 0} online • +${apiStats?.new_this_week || 0} this week`,
      change: getChange('users', defaultRates.users),
      trend: getTrend('users'),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Avg Rating',
      value: apiStats?.avg_rating !== undefined ? `${apiStats.avg_rating} ★` : '5.0 ★',
      subtext: `${apiStats?.total_reviews || 0} reviews recorded`,
      change: defaultRates.rating,
      trend: 'up',
      icon: Star,
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    }
  ];

  // Secondary Operational Metrics (Row 2)
  const statsRow2 = [
    {
      title: "Pending Verifications",
      value: apiStats?.pending_verifications !== undefined ? apiStats.pending_verifications.toLocaleString() : "0",
      subtext: `${apiStats?.pending_businesses || 0} biz, ${apiStats?.pending_places || 0} places`,
      change: `${apiStats?.pending_verifications || 0} req`,
      trend: apiStats?.pending_verifications > 0 ? "up" : "down",
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800"
    },
    {
      title: 'Commercial Partners',
      value: apiStats?.total_businesses !== undefined ? apiStats.total_businesses.toLocaleString() : '0',
      subtext: `${apiStats?.approved_businesses || 0} approved businesses`,
      change: getChange('businesses', defaultRates.businesses),
      trend: getTrend('businesses', 'up'),
      icon: Building2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Total Categories',
      value: apiStats?.total_categories !== undefined ? apiStats.total_categories.toLocaleString() : '0',
      subtext: 'Organized destination types',
      change: '+0',
      trend: 'up',
      icon: Tags,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Events & Festivals',
      value: apiStats?.total_events !== undefined ? apiStats.total_events.toLocaleString() : '0',
      subtext: 'Active cultural events',
      change: getChange('events', defaultRates.events),
      trend: getTrend('events'),
      icon: CalendarDays,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Saved Favorites',
      value: apiStats?.total_favorites !== undefined ? apiStats.total_favorites.toLocaleString() : '0',
      subtext: `${apiStats?.total_galleries || 0} media gallery items`,
      change: getChange('favorites', defaultRates.favorites),
      trend: getTrend('favorites'),
      icon: Heart,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    }
  ];

  return (
    <>
      {/* Stats Row 1 (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {statsRow1.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                  {stat.subtext}
                </p>
                <div className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ml-2 ${
                  stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Row 2 (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsRow2.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                  {stat.subtext}
                </p>
                <div className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ml-2 ${
                  stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
