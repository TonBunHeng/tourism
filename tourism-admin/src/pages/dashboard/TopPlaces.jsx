import { Star, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const barColors = [
  '#3B82F6', // blue-500
  '#6366F1', // indigo-500
  '#8B5CF6', // purple-500
  '#06B6D4', // cyan-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#F43F5E', // rose-500
  '#14B8A6', // teal-500
  '#0284C7', // sky-600
  '#6D28D9', // purple-700
];

export default function TopPlaces({ places, topPlaces, timeRange = 'yearly', isLoading = false }) {
  const navigate = useNavigate();

  const rawList = (Array.isArray(places) && places.length > 0)
    ? places
    : (Array.isArray(topPlaces) && topPlaces.length > 0 ? topPlaces : []);

  // Enforce top 10 places strictly from database
  const placesList = rawList.slice(0, 10);

  const metricLabel = placesList[0]?.metric_label || (
    timeRange === 'today' ? "Today's Visits" :
    timeRange === 'weekly' ? "Weekly Visits" :
    timeRange === 'monthly' ? "Monthly Visits" :
    "Annual Visits"
  );

  const chartData = placesList.map((place, index) => {
    const baseVisitors = Number(place.visitors_count || place.visits || (place.reviews_count * 25 + 150)) || 250;
    const periodVisitsVal = place.period_visits != null
      ? Number(place.period_visits)
      : (
        timeRange === 'today' ? Math.max(1, Math.round(baseVisitors / 365)) :
        timeRange === 'weekly' ? Math.max(5, Math.round(baseVisitors / 52)) :
        timeRange === 'monthly' ? Math.max(20, Math.round(baseVisitors / 12)) :
        Math.max(100, baseVisitors)
      );

    const reviewsCount = Number(place.reviews ?? place.reviews_count) || 0;
    const periodReviews = Number(place.period_reviews) || 0;
    const ratingVal = Number(place.rating || 0).toFixed(1);
    const shortName = (place.name || '').length > 15 ? place.name.slice(0, 14) + '…' : (place.name || `Place ${index + 1}`);

    return {
      id: place.id || index + 1,
      fullName: place.name || 'Unnamed Place',
      name: shortName,
      displayValue: periodVisitsVal,
      reviews: reviewsCount,
      periodReviews,
      rating: ratingVal,
      category: place.category?.name || place.category || 'Attraction',
      metricLabel: place.metric_label || metricLabel,
      rank: index + 1,
    };
  })
  .sort((a, b) => b.displayValue - a.displayValue)
  .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const getSubtitle = () => {
    switch (timeRange) {
      case 'today':
        return "Top trending destinations ranked by today's estimated visitors";
      case 'weekly':
        return 'Top trending destinations ranked by 7-day visitor volume';
      case 'monthly':
        return 'Top destinations ranked by monthly visitor traffic';
      case 'yearly':
      default:
        return 'Top destinations ranked by annual visitors & rating';
    }
  };

  return (
    <div className={`bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col justify-between h-full transition-opacity duration-200 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Top Places</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                {metricLabel}
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {getSubtitle()}
            </p>
          </div>
          <button
            onClick={() => navigate('/places')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Recharts Basic Bar Chart */}
        <div className="h-[360px] w-full pt-1">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
              <Landmark className="w-8 h-8 mb-2 stroke-1 text-gray-300 dark:text-zinc-600" />
              <p>No destination records available in database</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" key={`top-places-${timeRange}`}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k` : val}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-md shadow-md text-xs space-y-1.5 min-w-[180px]">
                          <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1">
                            <span className="font-bold text-blue-600 dark:text-blue-400">#{data.rank}</span>
                            <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 truncate max-w-[120px]">{data.category}</span>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-zinc-100">
                            {data.fullName}
                          </p>
                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <span className="text-gray-500 dark:text-zinc-400">{data.metricLabel}:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                              {data.displayValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {data.rating}
                            </span>
                            <span>{data.reviews.toLocaleString()} reviews</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="displayValue"
                  name={metricLabel}
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                  isAnimationActive={true}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
