import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Heart,
  Users,
  Star,
  CheckCircle2,
  Filter,
  RotateCcw,
  Calendar,
  ChevronDown,
  TrendingUp,
  Compass
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Link } from 'react-router-dom';
import favoriteService from '../../services/favoriteService';
import { useLanguage } from '../../i18n';

const EMPTY_FAVORITES = Object.freeze([]);

export default function FavoritesAnalytics({ favorites: initialFavorites = EMPTY_FAVORITES }) {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState(initialFavorites);
  const [timeframe, setTimeframe] = useState('Year');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [visitFilter, setVisitFilter] = useState('ALL');
  const [apiAnalytics, setApiAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritesChartTab, setFavoritesChartTab] = useState('category');

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case 'Day': return t('favorites.tfToday');
      case 'Week': return t('favorites.tfWeek');
      case 'Month': return t('favorites.tfMonth');
      case 'Year':
      default: return t('favorites.tfYear', { year: new Date().getFullYear() });
    }
  }, [timeframe, t]);

  // Sync prop favorites if passed from parent
  useEffect(() => {
    if (initialFavorites && initialFavorites.length > 0) {
      setFavorites(initialFavorites);
    }
  }, [initialFavorites]);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await favoriteService.getAnalytics({
        timeframe: timeframe.toLowerCase(),
        range: timeframe.toLowerCase(),
        time_range: timeframe.toLowerCase(),
        category: selectedCategory,
        visit_status: visitFilter
      });
      if (res && (res.success || res.data)) {
        const data = res.data || res;
        setApiAnalytics(data);
        if ((!initialFavorites || initialFavorites.length === 0) && (data.recent_favorites || data.favorites)) {
          setFavorites(data.recent_favorites || data.favorites);
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote favorites analytics:', e);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, selectedCategory, visitFilter, initialFavorites]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const safeFavorites = useMemo(() => (Array.isArray(favorites) ? favorites : []), [favorites]);

  const categories = useMemo(() => {
    if (apiAnalytics?.categories && Array.isArray(apiAnalytics.categories) && apiAnalytics.categories.length > 0) {
      return ['ALL', ...apiAnalytics.categories];
    }
    const set = new Set(safeFavorites.map(f => f.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [apiAnalytics, safeFavorites]);

  const filteredFavorites = useMemo(() => {
    const result = safeFavorites.filter(fav => {
      const matchesCategory = selectedCategory === 'ALL' || fav.category === selectedCategory;
      const isVisited = Boolean(fav.visited || fav.status === 'Visited');
      const matchesVisit =
        visitFilter === 'ALL' ||
        (visitFilter === 'VISITED' && isVisited) ||
        (visitFilter === 'PLANNED' && !isVisited);
      return matchesCategory && matchesVisit;
    });

    const now = new Date();
    if (timeframe === 'Day') {
      const dayFiltered = result.filter(f => {
        const dStr = f.created_at || f.saved_date || f.dateAdded;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && d <= now && now - d <= 24 * 60 * 60 * 1000;
      });
      return dayFiltered;
    } else if (timeframe === 'Week') {
      const weekFiltered = result.filter(f => {
        const dStr = f.created_at || f.saved_date || f.dateAdded;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && d <= now && now - d <= 7 * 24 * 60 * 60 * 1000;
      });
      return weekFiltered;
    } else if (timeframe === 'Month') {
      const monthFiltered = result.filter(f => {
        const dStr = f.created_at || f.saved_date || f.dateAdded;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && d <= now && now - d <= 30 * 24 * 60 * 60 * 1000;
      });
      return monthFiltered;
    } else if (timeframe === 'Year') {
      const yearFiltered = result.filter(f => {
        const dStr = f.created_at || f.saved_date || f.dateAdded;
        if (!dStr) return true;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && d.getFullYear() === now.getFullYear();
      });
      return yearFiltered;
    }

    return result;
  }, [safeFavorites, selectedCategory, visitFilter, timeframe]);

  // Real statistics calculations from API / database records
  const total = useMemo(() => {
    return apiAnalytics?.overview?.total_favorites ?? filteredFavorites.length;
  }, [apiAnalytics, filteredFavorites]);

  const visitedCount = useMemo(() => {
    return apiAnalytics?.overview?.visited_count ?? filteredFavorites.filter(f => Boolean(f.visited || f.status === 'Visited')).length;
  }, [apiAnalytics, filteredFavorites]);

  const plannedCount = useMemo(() => {
    return apiAnalytics?.overview?.wishlist_count ?? Math.max(0, total - visitedCount);
  }, [apiAnalytics, total, visitedCount]);

  const visitedPct = useMemo(() => {
    if (apiAnalytics?.overview?.conversion_rate !== undefined) {
      return Math.round(apiAnalytics.overview.conversion_rate);
    }
    return total > 0 ? Math.round((visitedCount / total) * 100) : 0;
  }, [apiAnalytics, visitedCount, total]);

  const plannedPct = total > 0 ? Math.max(0, 100 - visitedPct) : 0;

  const uniqueUsers = useMemo(() => {
    if (apiAnalytics?.overview?.unique_travelers !== undefined) {
      return apiAnalytics.overview.unique_travelers;
    }
    return new Set(
      filteredFavorites.map(f => f.user_id || f.user?.id || f.user_email || f.user?.name).filter(Boolean)
    ).size;
  }, [apiAnalytics, filteredFavorites]);

  const avgRating = useMemo(() => {
    if (apiAnalytics?.overview?.avg_rating !== undefined && Number(apiAnalytics.overview.avg_rating) > 0) {
      return Number(apiAnalytics.overview.avg_rating).toFixed(1);
    }
    const validRatings = filteredFavorites
      .map(f => Number(f.rating || f.place?.rating))
      .filter(r => !isNaN(r) && r > 0);
    return validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1)
      : '0.0';
  }, [apiAnalytics, filteredFavorites]);

  // Real trend data partitioned across Day, Week, Month, or Year
  const monthlyData = useMemo(() => {
    let labels = [];
    let getBucketIndex = (d) => 0;

    if (timeframe === 'Day') {
      labels = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];
      getBucketIndex = (d) => Math.min(5, Math.max(0, Math.floor(d.getHours() / 4)));
    } else if (timeframe === 'Week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      getBucketIndex = (d) => (d.getDay() + 6) % 7;
    } else if (timeframe === 'Month') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      getBucketIndex = (d) => Math.min(3, Math.max(0, Math.floor((d.getDate() - 1) / 7)));
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      getBucketIndex = (d) => d.getMonth();
    }

    if (apiAnalytics?.monthly_trends && Array.isArray(apiAnalytics.monthly_trends) && apiAnalytics.monthly_trends.length === labels.length) {
      let runningTotal = 0;
      return apiAnalytics.monthly_trends.map((apiItem, idx) => {
        const label = labels[idx];
        const count = Number(apiItem.newSaves ?? apiItem.count ?? apiItem.saves ?? 0);
        runningTotal += count;
        const visited = Number(apiItem.visitedCount ?? apiItem.visited ?? 0);
        const planned = Math.max(0, count - visited);
        return {
          month: label,
          label: label,
          period: label,
          newSaves: count,
          visited,
          planned,
          cumulative: apiItem.cumulative !== undefined ? Number(apiItem.cumulative) : runningTotal
        };
      });
    }

    const bucketVisited = labels.map(() => 0);
    const bucketPlanned = labels.map(() => 0);

    filteredFavorites.forEach(f => {
      const dateVal = f.created_at || f.saved_date || f.dateAdded;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const idx = getBucketIndex(d);
          if (idx >= 0 && idx < labels.length) {
            if (f.visited || f.status === 'Visited') {
              bucketVisited[idx] += 1;
            } else {
              bucketPlanned[idx] += 1;
            }
          }
        }
      }
    });

    let runningTotal = 0;
    return labels.map((label, idx) => {
      const visited = bucketVisited[idx];
      const planned = bucketPlanned[idx];
      const count = visited + planned;
      runningTotal += count;

      return {
        month: label,
        label: label,
        period: label,
        newSaves: count,
        visited,
        planned,
        cumulative: runningTotal
      };
    });
  }, [apiAnalytics, filteredFavorites, timeframe]);

  // Category distribution purely from database
  const categoryData = useMemo(() => {
    const fillColors = ['#003E83', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
    if (apiAnalytics?.category_distribution && Array.isArray(apiAnalytics.category_distribution)) {
      return apiAnalytics.category_distribution.map((item, idx) => ({
        ...item,
        percentage: total > 0 ? Math.round((Number(item.count || item.total || 0) / total) * 100) : 0,
        fillColor: item.fillColor || fillColors[idx % fillColors.length]
      }));
    }
    if (total === 0) return [];
    const counts = {};
    filteredFavorites.forEach(f => {
      const cat = f.category || (typeof f.place === 'object' ? f.place?.category : '') || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      fillColor: fillColors[idx % fillColors.length]
    })).sort((a, b) => b.count - a.count);
  }, [apiAnalytics, filteredFavorites, total]);

  const journeyData = useMemo(() => {
    if (total === 0) {
      return [{ name: t('favorites.noFavoritesRecorded'), value: 1, percentage: 0, color: '#9CA3AF' }];
    }
    return [
      { name: t('favorites.statusVisited'), value: visitedCount, percentage: visitedPct, color: '#10b981' },
      { name: t('favorites.statusToVisit'), value: plannedCount, percentage: plannedPct, color: '#3b82f6' }
    ].filter(item => item.value > 0);
  }, [visitedCount, visitedPct, plannedCount, plannedPct, total, t]);

  const isFilterActive = timeframe !== 'Year' || selectedCategory !== 'ALL' || visitFilter !== 'ALL';

  const handleResetFilters = () => {
    setTimeframe('Year');
    setSelectedCategory('ALL');
    setVisitFilter('ALL');
  };

  const stats = [
    {
      label: t('favorites.statTotalSaved'),
      value: total.toLocaleString(),
      subtext: total === 1 ? t('favorites.pillCountSingle') : t('favorites.pillCount', { count: total }),
      icon: Heart,
      color: 'text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)]',
      bg: 'bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)]'
    },
    {
      label: t('favorites.statUniqueTravelers'),
      value: uniqueUsers > 0 ? uniqueUsers.toLocaleString() : total > 0 ? '1' : '0',
      subtext: t('favorites.subtextUniqueTravelers'),
      icon: Users,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: t('favorites.statAvgPlaceScore'),
      value: `${avgRating} ★`,
      subtext: t('favorites.subtextAvgPlaceScore'),
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: t('favorites.statConversionRate'),
      value: `${visitedPct}%`,
      subtext: t('favorites.subtextConversionRate'),
      icon: CheckCircle2,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Standard Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              {t('favorites.analyticsTitle', 'Favorites Analytics')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              {t('favorites.analyticsSubtitle', 'Deep-dive engagement trends, category distributions, and traveler retention metrics')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Link
              to="/favorites"
              className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{t('favorites.backToFavorites', 'Back to Favorites')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* 3. Analytics Filters Toolbar */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] px-4 md:px-6 py-3.5 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#003E83] dark:text-blue-400 shrink-0" />
            <span className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              {t('favorites.filterAnalytics')}
            </span>
            <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('favorites.recordsCount', { count: total.toLocaleString() })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Category Select */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer shadow-xs"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'ALL' ? t('favorites.filterAllCategories') : cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>

            {/* Visit Status Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={visitFilter}
                onChange={(e) => setVisitFilter(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer shadow-xs"
              >
                <option value="ALL">{t('favorites.filterAllStatus')}</option>
                <option value="VISITED">{t('favorites.filterVisited')}</option>
                <option value="PLANNED">{t('favorites.filterToVisit')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>

            {/* Timeframe Selector Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={timeframe === '2026' ? 'Year' : (timeframe || 'Year')}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer shadow-xs"
              >
                <option value="Year">{t('favorites.tfYear', { year: new Date().getFullYear() })}</option>
                <option value="Month">{t('favorites.tfMonth')}</option>
                <option value="Week">{t('favorites.tfWeek')}</option>
                <option value="Day">{t('favorites.tfToday')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('favorites.resetBtn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Balanced Side-by-Side Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Chart 1: Favorites Growth & Retention */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header: Title + Volume Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>{t('favorites.chartGrowthTitle', { timeframe: timeframeLabel })}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                  {t('favorites.chartGrowthSubtitle')}
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 shrink-0 self-start sm:self-center">
                {t('favorites.totalSavedPill', { count: total.toLocaleString() })}
              </span>
            </div>

            {/* Clean Non-Wrapped Legend Under Title */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-3 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
                <span>{t('favorites.statusVisited')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#3b82f6]" />
                <span>{t('favorites.statusToVisit')}</span>
              </span>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    domain={[0, (dataMax) => (Number.isFinite(dataMax) && dataMax > 5 ? Math.ceil(dataMax * 1.1) : 5)]}
                    allowDecimals={false}
                    width={32}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const mData = payload[0]?.payload;
                        const vCount = mData?.visited || 0;
                        const pCount = mData?.planned || 0;
                        const totalM = vCount + pCount;
                        return (
                          <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-md shadow-md text-xs space-y-1.5 min-w-[170px]">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                              <p className="font-bold text-gray-900 dark:text-zinc-100">{label}</p>
                              <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">{totalM === 1 ? t('favorites.pillCountSingle') : t('favorites.pillCount', { count: totalM })}</span>
                            </div>
                            <div className="space-y-1 text-gray-600 dark:text-zinc-300">
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs bg-[#10b981]" />
                                  {t('favorites.statusVisited')}:
                                </span>
                                <span className="font-bold text-[#10b981]">{vCount}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs bg-[#3b82f6]" />
                                  {t('favorites.statusToVisit')}:
                                </span>
                                <span className="font-bold text-[#3b82f6]">{pCount}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="visited" stackId="status" fill="#10b981" radius={[0, 0, 0, 0]} name={t('favorites.statusVisited')} barSize={16} isAnimationActive={true} animationDuration={800} />
                  <Bar dataKey="planned" stackId="status" fill="#3b82f6" radius={[3, 3, 0, 0]} name={t('favorites.statusToVisit')} barSize={16} isAnimationActive={true} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 1 Symmetrical 3-Card Metrics Footer */}
          <div className="mt-3 pt-2.5 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] grid grid-cols-3 gap-2 text-center">
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{timeframeLabel}</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">{t('favorites.statAvgRating')}</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs sm:text-sm font-bold text-[#003E83] dark:text-blue-400">{total.toLocaleString()}</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">{t('favorites.statTotalFavorites')}</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]">{visitedPct}%</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] truncate">{t('favorites.statConversionRate')}</p>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Distribution & Visit Conversion */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('favorites.chartCategoryTitle')}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  {t('favorites.chartCategorySubtitle')}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-md border border-gray-200/50 dark:border-zinc-700/50 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFavoritesChartTab('category')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${favoritesChartTab === 'category'
                    ? 'bg-[var(--color-white)] dark:bg-zinc-900 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs'
                    : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {t('favorites.tabByCategory')}
                </button>
                <button
                  type="button"
                  onClick={() => setFavoritesChartTab('journey')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${favoritesChartTab === 'journey'
                    ? 'bg-[var(--color-white)] dark:bg-zinc-900 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs'
                    : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {t('favorites.tabByStatus')}
                </button>
              </div>
            </div>

            {/* Donut Chart Container */}
            <div className="relative h-[250px] w-full flex items-center justify-center my-1">
              {total === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                  <Compass className="w-8 h-8 mb-2 stroke-1 text-gray-300 dark:text-zinc-600" />
                  <p>{t('favorites.noFavoritesRecorded')}</p>
                </div>
              ) : (
                <>
                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                      {favoritesChartTab === 'category' ? total.toLocaleString() : `${visitedPct}%`}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                      {favoritesChartTab === 'category' ? t('favorites.statTotalFavorites') : t('favorites.statConversionRate')}
                    </span>
                  </div>

                  <div className="w-full h-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%" key={`fav-dist-${favoritesChartTab}`}>
                      <PieChart>
                        <Pie
                          data={
                            favoritesChartTab === 'category'
                              ? (categoryData.length > 0 ? categoryData : [{ name: 'No Category', count: 1, percentage: 0, fillColor: '#9CA3AF' }]).map(c => ({
                                name: c.name,
                                fullName: c.name,
                                count: Number(c.count) || 0,
                                percentage: c.percentage || 0,
                                fill: c.fillColor || '#003E83'
                              }))
                              : journeyData.map(j => ({
                                name: j.name,
                                fullName: j.name,
                                count: Number(j.value) || 0,
                                percentage: j.percentage || 0,
                                fill: j.color || '#10B981'
                              }))
                          }
                          dataKey="count"
                          nameKey="fullName"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={3}
                          stroke="none"
                          isAnimationActive={true}
                          animationDuration={600}
                          animationEasing="ease-out"
                        >
                          {(favoritesChartTab === 'category'
                            ? (categoryData.length > 0 ? categoryData.map(c => c.fillColor || '#003E83') : ['#9CA3AF'])
                            : journeyData.map(j => j.color || '#10B981')
                          ).map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip
                          wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-md shadow-md text-xs space-y-1">
                                  <p className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
                                    {data.fullName || data.name}
                                  </p>
                                  <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-zinc-800">
                                    <span className="text-gray-900 dark:text-zinc-100 font-bold">
                                      {data.count === 1 ? t('favorites.pillCountSingle') : t('favorites.pillCount', { count: data.count.toLocaleString() })}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                      ({data.percentage}%)
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>

            {/* Legend / Breakdown Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              {favoritesChartTab === 'category' ? (
                <>
                  {categoryData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fillColor }} />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-semibold shrink-0">
                        {item.percentage}% <span className="font-normal text-gray-400">({item.count})</span>
                      </span>
                    </div>
                  ))}
                  {categoryData.length === 0 && (
                    <p className="text-xs text-gray-400 col-span-2 text-center py-2">{t('favorites.noFavoritesRecorded')}</p>
                  )}
                </>
              ) : (
                <>
                  {journeyData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-semibold shrink-0">
                        {item.percentage}% <span className="font-normal text-gray-400">({item.value})</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-purple-500" />
                      <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                        {t('favorites.statUniqueTravelers')}
                      </span>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 text-[10px] font-semibold shrink-0">
                      {uniqueUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-amber-500" />
                      <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                        {t('favorites.statAvgPlaceScore')}
                      </span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold shrink-0">
                      {avgRating} ★
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cumulative Wishlist Growth & Save Trajectory Line Chart */}
      <div className="w-full bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-6 mb-6 sm:mb-8 transition-opacity duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              <span>{t('favorites.cumulativeGrowthTitle')} ({timeframeLabel})</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
              {t('favorites.cumulativeGrowthSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{t('favorites.totalSavedPill', { count: total.toLocaleString() })}</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const cumVal = payload.find(p => p.dataKey === 'cumulative')?.value ?? 0;
                    const newSavesVal = payload.find(p => p.dataKey === 'newSaves')?.value ?? 0;
                    return (
                      <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-3 rounded-md shadow-md text-xs space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                          <p className="font-bold text-gray-900 dark:text-zinc-100">{label} {timeframe !== 'ALL' ? timeframeLabel : ''}</p>
                          <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">{newSavesVal === 1 ? t('favorites.pillCountSingle') : t('favorites.pillCount', { count: newSavesVal })}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-zinc-300">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className="w-2.5 h-1 bg-[#4472C4] rounded-full" />
                              {t('favorites.cumulativeGrowthTitle')}:
                            </span>
                            <span className="font-bold text-[#4472C4]">{cumVal}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-zinc-300">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className="w-2.5 h-1 bg-[#ED7D31] rounded-full" />
                              {t('favorites.statTotalSaved')}:
                            </span>
                            <span className="font-bold text-[#ED7D31]">{newSavesVal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="plainline"
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name={t('favorites.cumulativeGrowthTitle')}
                stroke="#4472C4"
                strokeWidth={3}
                dot={{ r: 3, fill: '#4472C4' }}
                activeDot={{ r: 5, fill: '#4472C4' }}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="newSaves"
                name={t('favorites.statTotalSaved')}
                stroke="#ED7D31"
                strokeWidth={3}
                dot={{ r: 3, fill: '#ED7D31' }}
                activeDot={{ r: 5, fill: '#ED7D31' }}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
