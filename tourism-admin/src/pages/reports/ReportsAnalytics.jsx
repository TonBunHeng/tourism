import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  Activity,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Archive,
  Star,
  Sparkles,
  Download,
  Filter,
  RotateCcw,
  ChevronDown,
  TrendingUp,
  Database,
  Server
} from 'lucide-react';
import {
  ComposedChart,
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
import placeService from '../../services/placeService';
import eventService from '../../services/eventService';
import userService from '../../services/userService';
import reviewService from '../../services/reviewService';
import categoryService from '../../services/categoryService';
import reportService from '../../services/reportService';
import { getPageCache } from '../../utils/pageCache';
import { useLanguage } from '../../i18n';

export default function ReportsAnalytics({ datasets: initialDatasets = null }) {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState('Year');
  const [selectedDataset, setSelectedDataset] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const cachedFromReports = getPageCache('reports_datasets');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAnalytics, setApiAnalytics] = useState(null);
  const [reportsChartTab, setReportsChartTab] = useState('dataset');

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case 'Day': return t('reports.tfToday', 'Today');
      case 'Week': return t('reports.tfThisWeek', 'This Week');
      case 'Month': return t('reports.tfThisMonth', 'This Month');
      case 'Year':
      default: return t('reports.tfYear2026', '2026');
    }
  }, [timeframe, t]);

  // Raw dataset holders
  const [datasets, setDatasets] = useState(() => {
    if (initialDatasets && typeof initialDatasets === 'object') {
      return {
        places: Array.isArray(initialDatasets.places) ? initialDatasets.places : [],
        events: Array.isArray(initialDatasets.events) ? initialDatasets.events : [],
        users: Array.isArray(initialDatasets.users) ? initialDatasets.users : [],
        reviews: Array.isArray(initialDatasets.reviews) ? initialDatasets.reviews : [],
        categories: Array.isArray(initialDatasets.categories) ? initialDatasets.categories : []
      };
    }
    if (cachedFromReports) {
      return {
        places: cachedFromReports.places || [],
        events: cachedFromReports.events || [],
        users: cachedFromReports.users || [],
        reviews: cachedFromReports.reviews || [],
        categories: cachedFromReports.categories || []
      };
    }
    return {
      places: [],
      events: [],
      users: [],
      reviews: [],
      categories: []
    };
  });

  // Sync prop datasets or load directly if loaded as a standalone page
  useEffect(() => {
    if (initialDatasets && typeof initialDatasets === 'object') {
      setDatasets({
        places: Array.isArray(initialDatasets.places) ? initialDatasets.places : [],
        events: Array.isArray(initialDatasets.events) ? initialDatasets.events : [],
        users: Array.isArray(initialDatasets.users) ? initialDatasets.users : [],
        reviews: Array.isArray(initialDatasets.reviews) ? initialDatasets.reviews : [],
        categories: Array.isArray(initialDatasets.categories) ? initialDatasets.categories : []
      });
    } else if (!cachedFromReports) {
      const loadAllData = async () => {
        setIsLoading(true);
        try {
          const [placesRes, eventsRes, usersRes, reviewsRes, categoriesRes] = await Promise.allSettled([
            placeService.getPlaces({ per_page: 100 }),
            eventService.getEvents({ per_page: 100 }),
            userService.getUsers({ per_page: 100 }),
            reviewService.getReviews({ per_page: 100 }),
            categoryService.getCategories({ per_page: 100 })
          ]);

          const extractArray = (resVal) => {
            if (!resVal) return [];
            if (Array.isArray(resVal)) return resVal;
            if (Array.isArray(resVal.data)) return resVal.data;
            if (Array.isArray(resVal.data?.data)) return resVal.data.data;
            return [];
          };

          const rawPlaces = placesRes.status === 'fulfilled' ? extractArray(placesRes.value) : [];
          const rawEvents = eventsRes.status === 'fulfilled' ? extractArray(eventsRes.value) : [];
          const rawUsers = usersRes.status === 'fulfilled' ? extractArray(usersRes.value) : [];
          const rawReviews = reviewsRes.status === 'fulfilled' ? extractArray(reviewsRes.value) : [];
          const rawCategories = categoriesRes.status === 'fulfilled' ? extractArray(categoriesRes.value) : [];

          const formattedPlaces = rawPlaces.map(p => ({
            id: p.id,
            name: p.name || 'Unnamed Place',
            category: p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || 'General',
            province: p.province_name || (typeof p.province === 'object' ? p.province?.name : p.province) || 'Cambodia',
            rating: Number(p.rating || 0),
            reviews: Number(p.reviews_count || 0),
            status: p.status || 'Active',
            createdAt: p.created_at ? String(p.created_at).split('T')[0] : null,
            type: 'Place'
          }));

          const formattedEvents = rawEvents.map(e => ({
            id: e.id,
            title: e.title || 'Event',
            name: e.title || 'Event',
            location: e.location || 'Cambodia',
            startDate: e.start_date ? String(e.start_date).split('T')[0] : (e.created_at ? String(e.created_at).split('T')[0] : null),
            endDate: e.end_date ? String(e.end_date).split('T')[0] : null,
            attendees: Number(e.attendees_count || 0),
            status: e.status || 'Upcoming',
            createdAt: e.created_at ? String(e.created_at).split('T')[0] : null,
            type: 'Event'
          }));

          const formattedUsers = rawUsers.map(u => ({
            id: u.id,
            name: u.name || 'User',
            email: u.email || '',
            role: u.role || 'User',
            joinedDate: u.created_at ? String(u.created_at).split('T')[0] : null,
            createdAt: u.created_at ? String(u.created_at).split('T')[0] : null,
            status: u.status || 'Active',
            type: 'User'
          }));

          const formattedReviews = rawReviews.map(r => ({
            id: r.id,
            name: `${r.place_name || (typeof r.place === 'object' ? r.place?.name : 'Attraction')} Review`,
            userName: r.user_name || (typeof r.user === 'object' ? r.user?.name : r.user) || 'Traveler',
            rating: Number(r.rating || 0),
            comment: r.comment || '',
            date: r.created_at ? String(r.created_at).split('T')[0] : null,
            createdAt: r.created_at ? String(r.created_at).split('T')[0] : null,
            status: r.status || 'Approved',
            type: 'Review'
          }));

          const formattedCategories = rawCategories.map(c => ({
            id: c.id,
            name: c.name || 'Category',
            description: c.description || '',
            totalPlaces: Number(c.places_count || 0),
            status: c.status || 'Active',
            createdAt: c.created_at ? String(c.created_at).split('T')[0] : null,
            type: 'Category'
          }));

          setDatasets({
            places: formattedPlaces,
            events: formattedEvents,
            users: formattedUsers,
            reviews: formattedReviews,
            categories: formattedCategories
          });
        } catch (e) {
          console.warn('Failed to load datasets for Reports Analytics', e);
        } finally {
          setIsLoading(false);
        }
      };
      loadAllData();
    }
  }, [initialDatasets]);

  // Fetch server analytics
  useEffect(() => {
    reportService.getAnalytics({
      timeframe: timeframe.toLowerCase(),
      range: timeframe.toLowerCase(),
      dataset: selectedDataset,
      status: statusFilter
    })
      .then(res => {
        if (res?.success && res?.data) {
          setApiAnalytics(res.data);
        }
      })
      .catch((e) => {
        console.warn('Could not fetch server reports analytics:', e);
      });
  }, [timeframe, selectedDataset, statusFilter]);

  const places = useMemo(() => (Array.isArray(datasets.places) ? datasets.places : []), [datasets.places]);
  const events = useMemo(() => (Array.isArray(datasets.events) ? datasets.events : []), [datasets.events]);
  const users = useMemo(() => (Array.isArray(datasets.users) ? datasets.users : []), [datasets.users]);
  const reviews = useMemo(() => (Array.isArray(datasets.reviews) ? datasets.reviews : []), [datasets.reviews]);
  const categories = useMemo(() => (Array.isArray(datasets.categories) ? datasets.categories : []), [datasets.categories]);

  // Current dataset items based on selection
  const currentDatasetItems = useMemo(() => {
    switch (selectedDataset) {
      case 'places': return places;
      case 'events': return events;
      case 'users': return users;
      case 'reviews': return reviews;
      case 'categories': return categories;
      default: return [...places, ...events, ...users, ...reviews, ...categories];
    }
  }, [selectedDataset, places, events, users, reviews, categories]);

  // Filter items by status and timeframe
  const filteredItems = useMemo(() => {
    let items = currentDatasetItems;
    if (statusFilter !== 'ALL') {
      items = items.filter(item => {
        const s = (item.status || '').toLowerCase();
        if (statusFilter === 'Active') return s === 'active' || s === 'published' || s === 'approved';
        if (statusFilter === 'Pending') return s === 'pending' || s === 'upcoming';
        if (statusFilter === 'Archived') return s === 'archived' || s === 'inactive' || s === 'completed';
        return true;
      });
    }

    const now = new Date();
    if (timeframe === 'Day') {
      const dayFiltered = items.filter(item => {
        const dStr = item.createdAt || item.startDate || item.joinedDate || item.date;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && Math.abs(now - d) <= 24 * 60 * 60 * 1000;
      });
      return dayFiltered.length > 0 ? dayFiltered : items;
    } else if (timeframe === 'Week') {
      const weekFiltered = items.filter(item => {
        const dStr = item.createdAt || item.startDate || item.joinedDate || item.date;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && Math.abs(now - d) <= 7 * 24 * 60 * 60 * 1000;
      });
      return weekFiltered.length > 0 ? weekFiltered : items;
    } else if (timeframe === 'Month') {
      const monthFiltered = items.filter(item => {
        const dStr = item.createdAt || item.startDate || item.joinedDate || item.date;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && Math.abs(now - d) <= 30 * 24 * 60 * 60 * 1000;
      });
      return monthFiltered.length > 0 ? monthFiltered : items;
    } else if (timeframe === 'Year') {
      const yearFiltered = items.filter(item => {
        const dStr = item.createdAt || item.startDate || item.joinedDate || item.date;
        if (!dStr) return true;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && (d.getFullYear() === 2026 || d.getFullYear() === now.getFullYear());
      });
      return yearFiltered.length > 0 ? yearFiltered : items;
    }

    return items;
  }, [currentDatasetItems, statusFilter, timeframe]);

  const totalRecords = filteredItems.length;
  const globalTotalRecords = places.length + events.length + users.length + reviews.length + categories.length;

  // Active items and operational breakdown calculation
  const { activeCount, activePct, pendingCount, archivedCount } = useMemo(() => {
    const itemsToCheck = currentDatasetItems;
    if (itemsToCheck.length === 0) return { activeCount: 0, activePct: 0, pendingCount: 0, archivedCount: 0 };
    let active = 0;
    let pending = 0;
    let archived = 0;
    itemsToCheck.forEach(item => {
      const s = (item.status || 'active').toLowerCase();
      if (s === 'active' || s === 'published' || s === 'approved') {
        active += 1;
      } else if (s === 'pending' || s === 'upcoming') {
        pending += 1;
      } else {
        archived += 1;
      }
    });
    return {
      activeCount: active,
      activePct: Math.round((active / itemsToCheck.length) * 100),
      pendingCount: pending,
      archivedCount: archived
    };
  }, [currentDatasetItems]);

  const healthStatus = useMemo(() => {
    if (activePct >= 80) return { label: t('reports.healthOptimal', 'Optimal Health'), color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (activePct >= 60) return { label: t('reports.healthGood', 'Good Standing'), color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    return { label: t('reports.healthAttention', 'Attention Needed'), color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
  }, [activePct, t]);

  // Quality & Rating score
  const avgScore = useMemo(() => {
    const rated = [
      ...places.map(p => Number(p.rating)),
      ...reviews.map(r => Number(r.rating))
    ].filter(r => !isNaN(r) && r > 0);
    return rated.length > 0
      ? (rated.reduce((sum, r) => sum + r, 0) / rated.length).toFixed(1)
      : '0.0';
  }, [places, reviews]);

  // Real Ingestion Trends dynamically partitioned by Day, Week, Month, or Year
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
      let run = 0;
      return apiAnalytics.monthly_trends.map((item, idx) => {
        const label = labels[idx];
        const count = Number(item.recordsIngested ?? item.count ?? 0);
        const active = Number(item.active ?? Math.round(count * 0.8));
        const other = Math.max(0, count - active);
        run += count;
        return {
          month: label,
          label: label,
          period: label,
          recordsIngested: count,
          active,
          other,
          cumulative: run
        };
      });
    }

    const bucketItems = labels.map(() => []);
    filteredItems.forEach(item => {
      const dStr = item.createdAt || item.startDate || item.joinedDate || item.date;
      if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          const idx = getBucketIndex(d);
          if (idx >= 0 && idx < labels.length) {
            bucketItems[idx].push(item);
          }
        }
      }
    });

    let runningIngested = 0;
    return labels.map((label, idx) => {
      const itemsInBucket = bucketItems[idx];
      let active = 0;
      let other = 0;

      itemsInBucket.forEach(item => {
        const s = (item.status || 'active').toLowerCase();
        if (s === 'active' || s === 'published' || s === 'approved') {
          active += 1;
        } else {
          other += 1;
        }
      });

      const count = active + other;
      runningIngested += count;

      return {
        month: label,
        label: label,
        period: label,
        recordsIngested: count,
        active,
        other,
        cumulative: runningIngested
      };
    });
  }, [apiAnalytics, filteredItems, timeframe]);

  const peakMonth = useMemo(() => {
    return monthlyData.reduce((max, curr) => curr.recordsIngested > max.count ? { name: curr.month, count: curr.recordsIngested } : max, { name: monthlyData[0]?.month || 'Jan', count: 0 });
  }, [monthlyData]);

  // Composition Breakdown
  const compositionData = useMemo(() => {
    const palette = ['bg-[#003E83]', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
    const fillColors = ['#003E83', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];

    if (selectedDataset === 'ALL') {
      const total = globalTotalRecords || 1;
      return [
        { name: t('reports.datasetPlaces', 'Places & Attractions'), count: places.length, percentage: Math.round((places.length / total) * 100), color: palette[0], fillColor: fillColors[0] },
        { name: t('reports.datasetEvents', 'Events & Festivals'), count: events.length, percentage: Math.round((events.length / total) * 100), color: palette[1], fillColor: fillColors[1] },
        { name: t('reports.datasetUsers', 'Users & Accounts'), count: users.length, percentage: Math.round((users.length / total) * 100), color: palette[2], fillColor: fillColors[2] },
        { name: t('reports.datasetReviews', 'Ratings & Reviews'), count: reviews.length, percentage: Math.round((reviews.length / total) * 100), color: palette[3], fillColor: fillColors[3] },
        { name: t('reports.datasetCategories', 'Categories'), count: categories.length, percentage: Math.round((categories.length / total) * 100), color: palette[4], fillColor: fillColors[4] }
      ].filter(item => item.count > 0);
    }

    const map = {};
    if (selectedDataset === 'places') {
      places.forEach(p => {
        const key = p.category || 'General';
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'events') {
      events.forEach(e => {
        const key = e.status || 'Upcoming';
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'users') {
      users.forEach(u => {
        const key = u.role || 'User';
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'reviews') {
      reviews.forEach(r => {
        const key = `${r.rating || 5} Stars`;
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'categories') {
      categories.forEach(c => {
        const key = c.name || 'Category';
        map[key] = (map[key] || 0) + 1;
      });
    }

    const total = currentDatasetItems.length || 1;
    return Object.entries(map).map(([name, count], idx) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: palette[idx % palette.length],
      fillColor: fillColors[idx % fillColors.length]
    }));
  }, [selectedDataset, globalTotalRecords, places, events, users, reviews, categories, currentDatasetItems, t]);

  // Operational Status Breakdown Data (for Donut Hub)
  const statusBreakdownData = useMemo(() => {
    const total = currentDatasetItems.length || 1;
    return [
      { name: t('reports.statusActivePublished', 'Active / Published'), count: activeCount, percentage: Math.round((activeCount / total) * 100), color: '#10b981', bgClass: 'bg-emerald-500' },
      { name: t('reports.statusPendingReview', 'Pending / Review'), count: pendingCount, percentage: Math.round((pendingCount / total) * 100), color: '#f59e0b', bgClass: 'bg-amber-500' },
      { name: t('reports.statusArchivedInactive', 'Archived / Inactive'), count: archivedCount, percentage: Math.round((archivedCount / total) * 100), color: '#94a3b8', bgClass: 'bg-gray-400' }
    ].filter(item => item.count > 0 || currentDatasetItems.length === 0);
  }, [currentDatasetItems, activeCount, pendingCount, archivedCount, t]);

  const isFilterActive = timeframe !== 'Year' || selectedDataset !== 'ALL' || statusFilter !== 'ALL';

  const handleReset = () => {
    setTimeframe('Year');
    setSelectedDataset('ALL');
    setStatusFilter('ALL');
  };

  const stats = [
    {
      label: t('reports.kpiTotalIngested', 'Total Ingested Records'),
      value: totalRecords.toLocaleString(),
      subtext: t('reports.subtextTotalIngested', { count: globalTotalRecords.toLocaleString() }, `${globalTotalRecords.toLocaleString()} global records in DB`),
      icon: FileText,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: t('reports.kpiActiveRecords', 'Active System Records'),
      value: `${activePct}%`,
      subtext: t('reports.subtextActiveRecords', { count: activeCount.toLocaleString() }, `${activeCount.toLocaleString()} active/published entities`),
      icon: CheckCircle2,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      label: t('reports.kpiQualityIndex', 'Dataset Quality Index'),
      value: `${avgScore} ★`,
      subtext: t('reports.subtextQualityIndex', 'Average destination & feedback rating'),
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: t('reports.kpiSchemaScope', 'Database Schema Scope'),
      value: t('reports.valueSchemaScope', { count: Object.keys(datasets).length }, `${Object.keys(datasets).length} Tables`),
      subtext: t('reports.subtextSchemaScope', 'Places, Events, Users, Reviews, Categories'),
      icon: Layers,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Standard Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              {t('reports.analyticsTitle', 'Reports Analytics')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              {t('reports.analyticsSubtitle', 'Cross-dataset intelligence, volume trends, and database metrics')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Link
              to="/reports"
              className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{t('reports.btnBackToReports', 'Back to Reports')}</span>
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
              {t('reports.filterAnalytics', 'Filter Analytics')}
            </span>
            <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('reports.recordsCount', { count: totalRecords.toLocaleString() }, `(${totalRecords.toLocaleString()} records)`)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Dataset Selector */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer shadow-xs"
              >
                <option value="ALL">{t('reports.datasetAll', 'All Datasets (Global)')}</option>
                <option value="places">{t('reports.datasetPlaces', 'Places & Attractions')}</option>
                <option value="events">{t('reports.datasetEvents', 'Events & Festivals')}</option>
                <option value="users">{t('reports.datasetUsers', 'Users & Accounts')}</option>
                <option value="reviews">{t('reports.datasetReviews', 'Ratings & Reviews')}</option>
                <option value="categories">{t('reports.datasetCategories', 'Categories')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>

            {/* Status Selector */}
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer shadow-xs"
              >
                <option value="ALL">{t('reports.statusAllOptions', 'All Statuses')}</option>
                <option value="Active">{t('reports.statusActivePublished', 'Active / Published')}</option>
                <option value="Pending">{t('reports.statusPendingUpcoming', 'Pending / Upcoming')}</option>
                <option value="Archived">{t('reports.statusArchivedInactive', 'Archived / Inactive')}</option>
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
                <option value="Year">{t('reports.tfYear', 'Year')}</option>
                <option value="Month">{t('reports.tfMonth', 'Month')}</option>
                <option value="Week">{t('reports.tfWeek', 'Week')}</option>
                <option value="Day">{t('reports.tfDay', 'Day')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('reports.btnReset', 'Reset')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Balanced Side-by-Side Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        
        {/* Chart 1: Record Ingestion Velocity */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header: Title + Volume Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>{t('reports.chartVelocityTitle', { timeframe: timeframeLabel }, `Record Ingestion Velocity (${timeframeLabel})`)}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                  {timeframe === 'Day' 
                    ? t('reports.chartVelocityHourly', 'Hourly distribution of active/published vs pending records') 
                    : timeframe === 'Week' 
                      ? t('reports.chartVelocityDaily', 'Daily distribution of active/published vs pending records') 
                      : timeframe === 'Month' 
                        ? t('reports.chartVelocityWeekly', 'Weekly distribution of active/published vs pending records') 
                        : t('reports.chartVelocityMonthly', 'Monthly distribution of active/published vs pending records')}
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 shrink-0 self-start sm:self-center">
                {t('reports.totalVelocityRecords', { count: totalRecords.toLocaleString() }, `Total: ${totalRecords.toLocaleString()} Records`)}
              </span>
            </div>

            {/* Clean Non-Wrapped Legend Under Title */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-3 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
                <span>{t('reports.legendActivePublished', 'Active / Published')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#003E83]" />
                <span>{t('reports.legendPendingReview', 'Pending / Review')}</span>
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
                        const actCount = mData?.active || 0;
                        const othCount = mData?.other || 0;
                        const totM = actCount + othCount;
                        return (
                          <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-md shadow-md text-xs space-y-1.5 min-w-[170px]">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                              <p className="font-bold text-gray-900 dark:text-zinc-100">{label}</p>
                              <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                                {totM} {totM === 1 ? t('reports.tooltipSingleRecord', 'record') : t('reports.tooltipPluralRecords', 'records')}
                              </span>
                            </div>
                            <div className="space-y-1 text-gray-600 dark:text-zinc-300">
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs bg-[#10b981]" />
                                  {t('reports.tooltipActive', 'Active:')}
                                </span>
                                <span className="font-bold text-[#10b981]">{actCount}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs bg-[#003E83]" />
                                  {t('reports.tooltipPendingOther', 'Pending / Other:')}
                                </span>
                                <span className="font-bold text-[#003E83] dark:text-blue-400">{othCount}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="active" stackId="recs" fill="#10b981" radius={[0, 0, 0, 0]} name={t('reports.legendActivePublished', 'Active / Published')} barSize={16} isAnimationActive={true} animationDuration={800} />
                  <Bar dataKey="other" stackId="recs" fill="#003E83" radius={[3, 3, 0, 0]} name={t('reports.legendPendingReview', 'Pending / Review')} barSize={16} isAnimationActive={true} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Symmetrical 3-Card Metrics Footer */}
          <div className="mt-3 pt-2.5 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] grid grid-cols-3 gap-2 text-center">
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{timeframeLabel}</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                {t('reports.footerTimeframe', 'Timeframe')}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs sm:text-sm font-bold text-[#003E83] dark:text-blue-400">{totalRecords.toLocaleString()}</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                {t('reports.footerTotalIngested', 'Total Ingested')}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]">{peakMonth.name} ({peakMonth.count})</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] truncate">
                {t('reports.footerPeakIngestion', 'Peak Ingestion')}
              </p>
            </div>
          </div>
        </div>

        {/* Chart 2: System Health & Dataset Distribution Hub */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('reports.chartHealthHubTitle', 'System Health & Dataset Hub')}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  {t('reports.chartHealthHubSubtitle', 'Entity operational status and cross-dataset distribution')}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-md border border-gray-200/50 dark:border-zinc-700/50 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setReportsChartTab('dataset')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                    reportsChartTab === 'dataset'
                      ? 'bg-[var(--color-white)] dark:bg-zinc-900 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs'
                      : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t('reports.tabDatasetMix', 'Dataset Mix')}
                </button>
                <button
                  type="button"
                  onClick={() => setReportsChartTab('health')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                    reportsChartTab === 'health'
                      ? 'bg-[var(--color-white)] dark:bg-zinc-900 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs'
                      : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t('reports.tabHealthStatus', 'Health Status')}
                </button>
              </div>
            </div>

            {/* Donut Chart Container (Modeled identically to CategoryDistribution) */}
            <div className="relative h-[250px] w-full flex items-center justify-center my-1">
              {totalRecords === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                  <Activity className="w-8 h-8 mb-2 stroke-1 text-gray-300 dark:text-zinc-600" />
                  <p>{t('reports.noEntityRecordsFound', 'No entity records found')}</p>
                </div>
              ) : (
                <>
                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                      {reportsChartTab === 'dataset' ? totalRecords.toLocaleString() : `${activePct}%`}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                      {reportsChartTab === 'dataset' ? t('reports.donutTotalRecords', 'Total Records') : t('reports.donutOperational', 'Operational')}
                    </span>
                  </div>

                  <div className="w-full h-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%" key={`rep-dist-${reportsChartTab}`}>
                      <PieChart>
                        <Pie
                          data={
                            reportsChartTab === 'dataset'
                              ? (compositionData.length > 0 ? compositionData : [{ name: 'No Data', count: 1, percentage: 0, fillColor: '#9CA3AF' }]).map(c => ({
                                  name: c.name,
                                  fullName: c.name,
                                  count: Number(c.count) || 0,
                                  percentage: c.percentage || 0,
                                  fill: c.fillColor || '#003E83'
                                }))
                              : statusBreakdownData.map(s => ({
                                  name: s.name,
                                  fullName: s.name,
                                  count: Number(s.count) || 0,
                                  percentage: s.percentage || 0,
                                  fill: s.color || '#10B981'
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
                          {(reportsChartTab === 'dataset'
                            ? (compositionData.length > 0 ? compositionData.map(c => c.fillColor || '#003E83') : ['#9CA3AF'])
                            : statusBreakdownData.map(s => s.color || '#10B981')
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
                                      {data.count.toLocaleString()} {data.count === 1 ? t('reports.tooltipSingleRecord', 'record') : t('reports.tooltipPluralRecords', 'records')}
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
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

            {/* Legend / Breakdown Grid (CategoryDistribution design) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              {reportsChartTab === 'dataset' ? (
                <>
                  {compositionData.slice(0, 6).map((item) => (
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
                  {compositionData.length === 0 && (
                    <p className="text-xs text-gray-400 col-span-2 text-center py-2">
                      {t('reports.noCompositionRecordsFound', 'No composition records found')}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {statusBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-semibold shrink-0">
                        {item.percentage}% <span className="font-normal text-gray-400">({item.count})</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-purple-500" />
                      <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                        {t('reports.totalEntitiesLabel', 'Total Entities')}
                      </span>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 text-[10px] font-semibold shrink-0">
                      {totalRecords.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cumulative Database Growth & Ingestion Trajectory Line Chart (Modeled after UserGrowthChart) */}
      <div className="w-full bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-6 mb-6 sm:mb-8 transition-opacity duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              <span>{t('reports.chartTrajectoryTitle', { timeframe: timeframeLabel }, `Cumulative Database Growth & Ingestion Trajectory (${timeframeLabel})`)}</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
              {timeframe === 'Day' 
                ? t('reports.chartTrajectoryHourly', 'Total cumulative database footprint vs hourly new record intake')
                : timeframe === 'Week'
                  ? t('reports.chartTrajectoryDaily', 'Total cumulative database footprint vs daily new record intake')
                  : timeframe === 'Month'
                    ? t('reports.chartTrajectoryWeekly', 'Total cumulative database footprint vs weekly new record intake')
                    : t('reports.chartTrajectoryMonthly', 'Total cumulative database footprint vs monthly new record intake')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50">
              <TrendingUp className="w-3.5 h-3.5" />
              {t('reports.badgeTotalSystemRecords', { count: totalRecords.toLocaleString(), timeframe: timeframeLabel }, `${totalRecords.toLocaleString()} Total System Records (${timeframeLabel})`)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-[#003E83]" />
            {timeframe === 'Day' 
              ? t('reports.legendHourlyNew', 'Hourly New Records')
              : timeframe === 'Week' 
                ? t('reports.legendDailyNew', 'Daily New Records') 
                : timeframe === 'Month' 
                  ? t('reports.legendWeeklyNew', 'Weekly New Records') 
                  : t('reports.legendMonthlyNew', 'Monthly New Records')}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-[#10b981]" />
            {t('reports.legendCumulativeVolume', 'Cumulative Database Volume')}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                width={36}
                domain={[0, (dataMax) => (Number.isFinite(dataMax) && dataMax > 5 ? Math.ceil(dataMax * 1.1) : 5)]}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rec = payload.find(p => p.dataKey === 'recordsIngested')?.value ?? 0;
                    const cum = payload.find(p => p.dataKey === 'cumulative')?.value ?? 0;
                    return (
                      <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-3 rounded-md shadow-md text-xs space-y-1.5 min-w-[190px]">
                        <p className="font-bold text-gray-900 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 pb-1">{label} ({timeframeLabel})</p>
                        <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-zinc-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#003E83]" />
                            {timeframe === 'Day' 
                              ? t('reports.tooltipHourlyIngested', 'Hourly Ingested:') 
                              : timeframe === 'Week' 
                                ? t('reports.tooltipDailyIngested', 'Daily Ingested:') 
                                : timeframe === 'Month' 
                                  ? t('reports.tooltipWeeklyIngested', 'Weekly Ingested:') 
                                  : t('reports.tooltipMonthlyIngested', 'Monthly Ingested:')}
                          </span>
                          <span className="font-bold text-[#003E83] dark:text-blue-400">
                            {rec} {rec === 1 ? t('reports.tooltipSingleRecord', 'record') : t('reports.tooltipPluralRecords', 'records')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-zinc-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                            {t('reports.tooltipCumulativeVolume', 'Cumulative Volume:')}
                          </span>
                          <span className="font-bold text-[#10b981]">
                            {cum} {t('reports.tooltipTotal', 'total')}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="recordsIngested"
                stroke="#003E83"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#003E83' }}
                activeDot={{ r: 6 }}
                name={t('reports.lineNewRecordsIngested', 'New Records Ingested')}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#10b981' }}
                activeDot={{ r: 6 }}
                name={t('reports.lineCumulativeTotal', 'Cumulative Total')}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
