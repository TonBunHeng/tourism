import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Filter,
  RotateCcw,
  Calendar,
  ChevronDown,
  TrendingUp,
  Award
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
import reviewService from '../../services/reviewService';

export default function RatingsAnalytics({ reviews: initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [timeframe, setTimeframe] = useState('Year');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [apiAnalytics, setApiAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ratingChartTab, setRatingChartTab] = useState('stars');

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case 'Day': return 'Today';
      case 'Week': return 'This Week';
      case 'Month': return 'This Month';
      case 'Year':
      default: return '2026';
    }
  }, [timeframe]);

  // Sync prop reviews if passed from parent
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, selectedCategory, ratingFilter]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await reviewService.getAnalytics({
        timeframe: timeframe.toLowerCase(),
        range: timeframe.toLowerCase(),
        time_range: timeframe.toLowerCase(),
        category: selectedCategory,
        rating: ratingFilter
      });
      if (res && (res.success || res.data)) {
        const data = res.data || res;
        setApiAnalytics(data);
        // Fallback reviews populate directly from analytics endpoint without double fetching
        if ((!initialReviews || initialReviews.length === 0) && (data.recent_reviews || data.reviews)) {
          setReviews(data.recent_reviews || data.reviews);
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote ratings analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract all categories dynamically from backend analytics or reviews
  const categories = useMemo(() => {
    if (apiAnalytics?.categories && Array.isArray(apiAnalytics.categories) && apiAnalytics.categories.length > 0) {
      return apiAnalytics.categories;
    }
    const set = new Set();
    reviews.forEach(r => {
      const cat = r.category || (typeof r.place === 'object' ? r.place?.category : null);
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [apiAnalytics, reviews]);

  // Filter reviews locally based on timeframe, category, and rating
  const filteredReviews = useMemo(() => {
    const result = reviews.filter(r => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const cat = r.category || (typeof r.place === 'object' ? r.place?.category : '') || '';
        if (cat.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Rating filter
      const rating = Number(r.rating || 0);
      if (ratingFilter === '5' && rating !== 5) return false;
      if (ratingFilter === '4' && rating !== 4) return false;
      if (ratingFilter === '3' && rating !== 3) return false;
      if (ratingFilter === '2' && rating !== 2) return false;
      if (ratingFilter === '1' && rating !== 1) return false;
      if (ratingFilter === 'positive' && rating < 4) return false;
      if (ratingFilter === 'critical' && rating > 3) return false;

      return true;
    });

    const now = new Date();
    if (timeframe === 'Day') {
      const dayFiltered = result.filter(r => {
        const dateStr = r.created_at || r.date;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return !isNaN(d.getTime()) && Math.abs(now - d) <= 24 * 60 * 60 * 1000;
      });
      return dayFiltered.length > 0 ? dayFiltered : result;
    } else if (timeframe === 'Week') {
      const weekFiltered = result.filter(r => {
        const dateStr = r.created_at || r.date;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return !isNaN(d.getTime()) && Math.abs(now - d) <= 7 * 24 * 60 * 60 * 1000;
      });
      return weekFiltered.length > 0 ? weekFiltered : result;
    } else if (timeframe === 'Month') {
      const monthFiltered = result.filter(r => {
        const dateStr = r.created_at || r.date;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return !isNaN(d.getTime()) && Math.abs(now - d) <= 30 * 24 * 60 * 60 * 1000;
      });
      return monthFiltered.length > 0 ? monthFiltered : result;
    } else if (timeframe === 'Year') {
      const yearFiltered = result.filter(r => {
        const dateStr = r.created_at || r.date;
        if (!dateStr) return true;
        const d = new Date(dateStr);
        return !isNaN(d.getTime()) && (d.getFullYear() === 2026 || d.getFullYear() === now.getFullYear());
      });
      return yearFiltered.length > 0 ? yearFiltered : result;
    }

    return result;
  }, [reviews, selectedCategory, ratingFilter, timeframe]);

  // Computed metrics directly from database / filtered reviews
  const total = useMemo(() => {
    return apiAnalytics?.overview?.total_ratings ?? filteredReviews.length;
  }, [apiAnalytics, filteredReviews]);

  const avgRating = useMemo(() => {
    if (apiAnalytics?.overview?.avg_rating !== undefined) {
      return Number(apiAnalytics.overview.avg_rating).toFixed(1);
    }
    if (filteredReviews.length === 0) return '0.0';
    const sum = filteredReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return (sum / filteredReviews.length).toFixed(1);
  }, [apiAnalytics, filteredReviews]);

  const positiveCount = useMemo(() => {
    if (apiAnalytics?.overview?.positive_count !== undefined) {
      return apiAnalytics.overview.positive_count;
    }
    return filteredReviews.filter(r => Number(r.rating || 0) >= 4).length;
  }, [apiAnalytics, filteredReviews]);

  const positivePct = useMemo(() => {
    if (apiAnalytics?.overview?.positive_sentiment_pct !== undefined) {
      return Math.round(apiAnalytics.overview.positive_sentiment_pct);
    }
    if (total === 0) return 0;
    return Math.round((positiveCount / total) * 100);
  }, [apiAnalytics, positiveCount, total]);

  const verifiedPct = useMemo(() => {
    if (apiAnalytics?.overview?.verification_pct !== undefined) {
      return Math.round(apiAnalytics.overview.verification_pct);
    }
    if (total === 0) return 0;
    const count = filteredReviews.filter(r => {
      const user = r.user;
      return r.is_verified || (typeof user === 'object' && user?.verified);
    }).length;
    return Math.round((count / total) * 100);
  }, [apiAnalytics, filteredReviews, total]);

  // Trends data partitioned dynamically across Day, Week, Month, or Year
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
        const count = Number(apiItem.ratingsCount ?? apiItem.count ?? apiItem.total ?? 0);
        runningTotal += count;
        const positive = Number(apiItem.positive ?? Math.round(count * 0.7));
        const neutral = Number(apiItem.neutral ?? Math.round(count * 0.2));
        const critical = Math.max(0, count - positive - neutral);
        const avg = apiItem.avgRating ?? apiItem.avg_rating ?? 4.5;
        return {
          month: label,
          label: label,
          period: label,
          ratingsCount: count,
          positive,
          neutral,
          critical,
          avgRating: Number(avg),
          monthAvg: Number(avg),
          cumulative: runningTotal
        };
      });
    }

    const bucketReviews = labels.map(() => []);
    filteredReviews.forEach(r => {
      const dateStr = r.created_at || r.date;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const idx = getBucketIndex(d);
          if (idx >= 0 && idx < labels.length) {
            bucketReviews[idx].push(r);
          }
        }
      }
    });

    let runningTotal = 0;
    let runningSum = 0;
    let runningCount = 0;

    return labels.map((label, idx) => {
      const mReviews = bucketReviews[idx];
      const count = mReviews.length;
      runningTotal += count;

      const positive = mReviews.filter(r => Number(r.rating || 0) >= 4).length;
      const neutral = mReviews.filter(r => Math.round(Number(r.rating || 0)) === 3).length;
      const critical = mReviews.filter(r => {
        const score = Math.round(Number(r.rating || 0));
        return score >= 1 && score <= 2;
      }).length;

      let bucketAvg = null;
      if (mReviews.length > 0) {
        const sum = mReviews.reduce((a, b) => a + Number(b.rating || 0), 0);
        bucketAvg = Number((sum / mReviews.length).toFixed(1));
        runningSum += sum;
        runningCount += mReviews.length;
      }

      const scoreTrajectory = runningCount > 0 ? Number((runningSum / runningCount).toFixed(1)) : (bucketAvg || 4.5);

      return {
        month: label,
        label: label,
        period: label,
        ratingsCount: count,
        positive,
        neutral,
        critical,
        avgRating: Number(scoreTrajectory),
        monthAvg: bucketAvg !== null ? Number(bucketAvg) : null,
        cumulative: runningTotal
      };
    });
  }, [apiAnalytics, filteredReviews, timeframe]);

  // Star breakdown distribution matching Recharts BarChart with semantic tier colors
  const starColors = {
    5: '#10b981', // 5 Stars: Emerald
    4: '#3b82f6', // 4 Stars: Blue
    3: '#f59e0b', // 3 Stars: Amber
    2: '#f97316', // 2 Stars: Orange
    1: '#ef4444', // 1 Star: Rose Red
  };

  const ratingDistribution = useMemo(() => {
    let baseData = [];
    if (apiAnalytics?.rating_distribution && Array.isArray(apiAnalytics.rating_distribution)) {
      baseData = apiAnalytics.rating_distribution;
    } else {
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      filteredReviews.forEach(r => {
        const stars = Math.round(Number(r.rating || 5));
        if (stars >= 1 && stars <= 5) {
          counts[stars] = (counts[stars] || 0) + 1;
        }
      });
      baseData = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: counts[stars],
        percentage: total > 0 ? Math.round((counts[stars] / total) * 100) : 0
      }));
    }

    return baseData.map(item => {
      const starValue = item.stars || item.rating || 0;
      const count = item.count || item.total || 0;
      return {
        ...item,
        stars: starValue,
        count: count,
        name: item.name || `${starValue} Stars`,
        fillColor: item.fillColor || starColors[starValue] || '#f59e0b'
      };
    });
  }, [apiAnalytics, filteredReviews, total]);

  const neutralCount = useMemo(() => {
    return filteredReviews.filter(r => Math.round(Number(r.rating || 0)) === 3).length;
  }, [filteredReviews]);

  const neutralPct = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((neutralCount / total) * 100);
  }, [neutralCount, total]);

  const criticalCount = useMemo(() => {
    if (filteredReviews.length > 0) {
      return filteredReviews.filter(r => {
        const score = Math.round(Number(r.rating || 0));
        return score >= 1 && score <= 2;
      }).length;
    }
    if (apiAnalytics?.overview?.critical_count !== undefined) {
      return apiAnalytics.overview.critical_count;
    }
    return Math.max(0, total - positiveCount - neutralCount);
  }, [apiAnalytics, filteredReviews, total, positiveCount, neutralCount]);

  const criticalPct = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((criticalCount / total) * 100);
  }, [criticalCount, total]);

  const netSentimentScore = useMemo(() => {
    if (total === 0) return 0;
    return Math.round(((positiveCount - criticalCount) / total) * 100);
  }, [positiveCount, criticalCount, total]);

  const csatStatus = useMemo(() => {
    if (positivePct >= 80) return { label: 'Excellent', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
    if (positivePct >= 65) return { label: 'Good', color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800' };
    if (positivePct >= 50) return { label: 'Average', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
    return { label: 'Needs Attention', color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800' };
  }, [positivePct]);

  const sentimentData = useMemo(() => {
    if (total === 0) {
      return [{ name: 'No Reviews', value: 1, percentage: 0, color: '#9CA3AF' }];
    }
    return [
      { name: 'Positive (4-5★)', value: positiveCount, percentage: positivePct, color: '#10b981' },
      { name: 'Neutral (3★)', value: neutralCount, percentage: neutralPct, color: '#f59e0b' },
      { name: 'Critical (1-2★)', value: criticalCount, percentage: criticalPct, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [positiveCount, neutralCount, criticalCount, positivePct, neutralPct, criticalPct, total]);

  const isFilterActive = timeframe !== 'Year' || selectedCategory !== 'ALL' || ratingFilter !== 'ALL';

  const handleResetFilters = () => {
    setTimeframe('Year');
    setSelectedCategory('ALL');
    setRatingFilter('ALL');
  };

  const stats = [
    {
      label: 'Total Reviews',
      value: total.toLocaleString(),
      subtext: total === 1 ? '1 review recorded' : `${total.toLocaleString()} reviews recorded`,
      icon: MessageSquare,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: 'Average Rating',
      value: `${avgRating} ★`,
      subtext: 'Destination score out of 5.0',
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: 'Positive Sentiment',
      value: `${positivePct}%`,
      subtext: `${positiveCount} of ${total} rated 4-5★`,
      icon: ThumbsUp,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      label: 'Verified Reviews',
      value: `${verifiedPct}%`,
      subtext: 'Authentic traveler feedback',
      icon: ShieldCheck,
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
              Ratings & Reviews Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Summary of traveler ratings, score trajectory, and destination feedback
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Link
              to="/ratings"
              className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Back to Reviews</span>
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
              Filter Analytics
            </span>
            <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              ({total.toLocaleString()} records)
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
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>

            {/* Rating Stars Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer shadow-xs"
              >
                <option value="ALL">All Star Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars Only</option>
                <option value="3">3 Stars Only</option>
                <option value="2">2 Stars Only</option>
                <option value="1">1 Star Only</option>
                <option value="positive">Positive (4★ & 5★)</option>
                <option value="critical">Needs Attention (1★ - 3★)</option>
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
                <option value="Year">Year</option>
                <option value="Month">Month</option>
                <option value="Week">Week</option>
                <option value="Day">Day</option>
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
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 & 5. Balanced Side-by-Side Analytics Charts Grid (Option B: Upgraded Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Chart 1: Monthly Sentiment Velocity */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header: Title + Volume Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Sentiment Velocity ({timeframeLabel})</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                  Distribution of positive, neutral, and critical traveler ratings
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 shrink-0 self-start sm:self-center">
                Total: {total.toLocaleString()} Reviews
              </span>
            </div>

            {/* Clean Non-Wrapped Legend Under Title */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-3 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
                <span>Positive (4-5★)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b]" />
                <span>Neutral (3★)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#ef4444]" />
                <span>Critical (1-2★)</span>
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
                        const pos = payload.find(p => p.dataKey === 'positive')?.value ?? 0;
                        const neu = payload.find(p => p.dataKey === 'neutral')?.value ?? 0;
                        const crit = payload.find(p => p.dataKey === 'critical')?.value ?? 0;
                        const totalM = pos + neu + crit;
                        return (
                          <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-md shadow-md text-xs space-y-1.5 min-w-[170px]">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                              <p className="font-bold text-gray-900 dark:text-zinc-100">{label}</p>
                              <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">{totalM} {totalM === 1 ? 'review' : 'reviews'}</span>
                            </div>
                            <div className="space-y-1 text-gray-600 dark:text-zinc-300">
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs bg-[#10b981]" />
                                  Positive (4-5★):
                                </span>
                                <span className="font-bold text-[#10b981]">{pos}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs bg-[#f59e0b]" />
                                  Neutral (3★):
                                </span>
                                <span className="font-bold text-[#f59e0b]">{neu}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs bg-[#ef4444]" />
                                  Critical (1-2★):
                                </span>
                                <span className="font-bold text-[#ef4444]">{crit}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="positive" stackId="sentiment" fill="#10b981" radius={[0, 0, 0, 0]} name="Positive (4-5★)" barSize={16} isAnimationActive={true} animationDuration={800} />
                  <Bar dataKey="neutral" stackId="sentiment" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Neutral (3★)" barSize={16} isAnimationActive={true} animationDuration={800} />
                  <Bar dataKey="critical" stackId="sentiment" fill="#ef4444" radius={[3, 3, 0, 0]} name="Critical (1-2★)" barSize={16} isAnimationActive={true} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 1 Symmetrical 3-Card Metrics Footer */}
          <div className="mt-3 pt-2.5 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] grid grid-cols-3 gap-2 text-center">
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{timeframeLabel}</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">Timeframe</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs sm:text-sm font-bold text-[#003E83] dark:text-blue-400">{total.toLocaleString()}</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">Total Volume</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]">{positivePct}%</p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] truncate">Positive Share</p>
            </div>
          </div>
        </div>

        {/* Chart 2: Net Sentiment & Star Distribution Hub */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Net Sentiment & Star Distribution</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  Satisfaction index (CSAT) & 5-tier star breakdown
                </p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-md border border-gray-200/50 dark:border-zinc-700/50 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setRatingChartTab('stars')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                    ratingChartTab === 'stars'
                      ? 'bg-[var(--color-white)] dark:bg-zinc-900 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs'
                      : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  By Stars
                </button>
                <button
                  type="button"
                  onClick={() => setRatingChartTab('sentiment')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                    ratingChartTab === 'sentiment'
                      ? 'bg-[var(--color-white)] dark:bg-zinc-900 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs'
                      : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Sentiment
                </button>
              </div>
            </div>

            {/* Donut Chart Container (Modeled identically to CategoryDistribution) */}
            <div className="relative h-[250px] w-full flex items-center justify-center my-1">
              {total === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                  <Award className="w-8 h-8 mb-2 stroke-1 text-gray-300 dark:text-zinc-600" />
                  <p>No ratings recorded yet</p>
                </div>
              ) : (
                <>
                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                      {ratingChartTab === 'stars' ? `${avgRating} ★` : `${positivePct}%`}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                      {ratingChartTab === 'stars' ? `Avg (${total.toLocaleString()} Reviews)` : 'CSAT Score'}
                    </span>
                  </div>

                  <div className="w-full h-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%" key={`ratings-dist-${ratingChartTab}`}>
                      <PieChart>
                        <Pie
                          data={
                            ratingChartTab === 'stars'
                              ? ratingDistribution.map(item => ({
                                  name: `${item.stars} Stars`,
                                  fullName: `${item.stars} Stars Rating`,
                                  count: item.count,
                                  percentage: item.percentage,
                                  fill: item.fillColor
                                }))
                              : sentimentData.map(item => ({
                                  name: item.name,
                                  fullName: item.name,
                                  count: item.value,
                                  percentage: item.percentage,
                                  fill: item.color
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
                          {(ratingChartTab === 'stars'
                            ? ratingDistribution.map(item => item.fillColor)
                            : sentimentData.map(item => item.color)
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
                                      {data.count.toLocaleString()} {data.count === 1 ? 'review' : 'reviews'}
                                    </span>
                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
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
              {ratingChartTab === 'stars' ? (
                <>
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center justify-between text-xs min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fillColor }} />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                          {item.stars} Stars
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-semibold shrink-0">
                        {item.percentage}% <span className="font-normal text-gray-400">({item.count})</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-600" />
                      <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                        Net Sentiment
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-[10px] font-semibold shrink-0">
                      {netSentimentScore >= 0 ? `+${netSentimentScore}` : netSentimentScore} <span className="font-normal text-gray-400">({positivePct}% pos)</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {sentimentData.map((item) => (
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
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-600" />
                      <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                        Net Sentiment
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-[10px] font-semibold shrink-0">
                      {netSentimentScore >= 0 ? `+${netSentimentScore}` : netSentimentScore} <span className="font-normal text-gray-400">(Score)</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Rating Score Progression & Trajectory Line Chart (Modeled after UserGrowthChart) */}
      <div className="w-full bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-6 mb-6 sm:mb-8 transition-opacity duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              <span>Average Rating Score Progression ({timeframeLabel})</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
              Score trajectory and trend analysis from database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-md border border-amber-200 dark:border-amber-900/50">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Overall Score: {avgRating} ★ ({total} Reviews)</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={false} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const trajectoryVal = payload.find(p => p.dataKey === 'avgRating')?.value;
                    const monthAvgVal = payload.find(p => p.dataKey === 'monthAvg')?.value;
                    const mData = payload[0]?.payload;
                    return (
                      <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-3 rounded-md shadow-md text-xs space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                          <p className="font-bold text-gray-900 dark:text-zinc-100">{label} {timeframe !== 'ALL' ? timeframe : ''}</p>
                          <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">{mData?.ratingsCount || 0} reviews</span>
                        </div>
                        <div className="space-y-1.5">
                          {trajectoryVal !== undefined && (
                            <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-zinc-300">
                              <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-2.5 h-1 bg-[#4472C4] rounded-full" />
                                Score Trajectory (Prevailing):
                              </span>
                              <span className="font-bold text-[#4472C4]">{Number(trajectoryVal).toFixed(1)} ★</span>
                            </div>
                          )}
                          {monthAvgVal !== undefined && monthAvgVal !== null && (
                            <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-zinc-300">
                              <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-2.5 h-1 bg-[#ED7D31] rounded-full" />
                                In-Month Average Score:
                              </span>
                              <span className="font-bold text-[#ED7D31]">{Number(monthAvgVal).toFixed(1)} ★</span>
                            </div>
                          )}
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
                dataKey="avgRating"
                name="Score Trajectory (Prevailing)"
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
                dataKey="monthAvg"
                name="In-Month Average Score"
                stroke="#ED7D31"
                strokeWidth={3}
                dot={{ r: 3, fill: '#ED7D31' }}
                activeDot={{ r: 5, fill: '#ED7D31' }}
                connectNulls={true}
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
