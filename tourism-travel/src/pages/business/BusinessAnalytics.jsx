import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Star,
  TrendingUp,
  Loader2,
  PieChart as PieChartIcon,
  Users,
  DollarSign,
  Tag,
  Sparkles,
  ShieldCheck,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import businessService from '../../services/businessService';
import Breadcrumb from '../../components/common/Breadcrumb';

const CustomMonthlyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 text-xs space-y-1.5 min-w-[180px]">
        <p className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-1">
          {label} 2026
        </p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {entry.dataKey === 'revenue' || entry.name.toLowerCase().includes('revenue')
                ? `$${Number(entry.value).toLocaleString()}`
                : Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 text-xs min-w-[150px]">
        <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.payload.color }} />
          {data.name}
        </p>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">
          Total: <span className="font-bold text-gray-900 dark:text-white">{data.value}</span>
        </p>
        <p className="text-gray-500 dark:text-zinc-400">
          Share: <span className="font-bold text-gray-900 dark:text-white">{data.payload.percentage || Math.round(data.percent * 100)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function BusinessAnalytics() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBiz, setSelectedBiz] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pieMode, setPieMode] = useState('ratings'); // 'ratings' | 'bookings'

  useEffect(() => {
    const init = async () => {
      try {
        const res = await businessService.getOwnerBusinesses();
        const list = res?.data?.businesses || res?.data || res || [];
        const validList = Array.isArray(list) ? list : [];
        setBusinesses(validList);
        if (validList.length > 0) {
          setSelectedBiz(validList[0].id);
        }
      } catch (err) {
        console.error('Failed to load owned businesses:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedBiz) {
      const loadStats = async () => {
        setStatsLoading(true);
        try {
          const res = await businessService.getStatistics(selectedBiz);
          setStats(res?.data || res || null);
        } catch (err) {
          console.error('Failed to fetch business statistics:', err);
        } finally {
          setStatsLoading(false);
        }
      };
      loadStats();
    }
  }, [selectedBiz]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading Business Analytics...</p>
      </div>
    );
  }

  // All data comes strictly from the DB response
  const chartData = Array.isArray(stats?.growth_data) ? stats.growth_data : [];
  const ratingData = Array.isArray(stats?.rating_distribution) ? stats.rating_distribution : [];
  const bookingData = Array.isArray(stats?.booking_distribution) ? stats.booking_distribution : [];

  const activePieData = pieMode === 'ratings' ? ratingData : bookingData;
  const hasPieData = activePieData.some((item) => (Number(item.value) || 0) > 0);

  // Peak metrics computed strictly from DB chart data
  const peakBookingsItem = chartData.reduce(
    (prev, curr) => ((curr.bookings || 0) > (prev?.bookings || 0) ? curr : prev),
    null
  );
  const peakRevenueItem = chartData.reduce(
    (prev, curr) => ((curr.revenue || 0) > (prev?.revenue || 0) ? curr : prev),
    null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Business Portal', to: '/business/dashboard' },
          { label: 'Performance Analytics' },
        ]}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Performance & Revenue Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Business Performance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Real-time tracking of bookings, earned revenue, and traveler reviews computed directly from live database records.
            </p>
          </div>

          {businesses.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedBiz}
                  onChange={(e) => setSelectedBiz(e.target.value)}
                  className="pl-4 pr-9 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#003E83]/20 shadow-2xs cursor-pointer"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <Link
                to="/business/reports"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Full Reports & Export</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {statsLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
          <p className="text-xs text-gray-500 dark:text-zinc-400">Loading business metrics...</p>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Rating */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-2 shadow-xs hover:border-amber-200 dark:hover:border-zinc-700 transition-colors">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Average Rating</span>
              <p className="text-3xl font-black text-amber-500 flex items-center gap-2">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                {stats.rating > 0 ? stats.rating : 'N/A'}
              </p>
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                {stats.approved_reviews || 0} approved review{stats.approved_reviews === 1 ? '' : 's'} ({stats.total_reviews || 0} total)
              </span>
            </div>

            {/* 2. Total Bookings */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-2 shadow-xs hover:border-blue-200 dark:hover:border-zinc-700 transition-colors">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Total Reservations</span>
              <p className="text-3xl font-black text-[#003E83] dark:text-[#60a5fa] flex items-center gap-2">
                <CalendarCheck className="w-6 h-6 text-[#003E83] dark:text-[#60a5fa]" />
                {stats.total_bookings || 0}
              </p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.completed_bookings || 0} completed • {stats.pending_bookings || 0} pending
              </span>
            </div>

            {/* 3. Earned Revenue */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-2 shadow-xs hover:border-emerald-200 dark:hover:border-zinc-700 transition-colors">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Confirmed Revenue</span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-500" />
                ${Number(stats.total_revenue || 0).toLocaleString()}
              </p>
              <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {stats.total_guests || 0} traveler guest{stats.total_guests === 1 ? '' : 's'} hosted
              </span>
            </div>

            {/* 4. Active Services */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-2 shadow-xs hover:border-indigo-200 dark:hover:border-zinc-700 transition-colors">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Listed Services</span>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-500" />
                {stats.total_services || 0}
              </p>
              <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                {stats.active_promotions || 0} active promotion{stats.active_promotions === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Monthly Performance Line Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#003E83] dark:text-[#60a5fa]" />
                      <span>Monthly Bookings & Revenue (2026)</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      Jan - Dec 2026 Monthly Reservations & Earned Revenue from Database
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Live Database Sync
                    </span>
                  </div>
                </div>

                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
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
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomMonthlyTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="plainline"
                        wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        name="Customer Bookings"
                        stroke="#003E83"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue ($ USD)"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Peaks Summary calculated from DB */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#003E83] dark:bg-[#60a5fa] rounded-full inline-block" />
                  Peak Reservations:{'} '}
                  <strong>
                    {peakBookingsItem && peakBookingsItem.bookings > 0
                      ? `${peakBookingsItem.bookings} booking${peakBookingsItem.bookings === 1 ? '' : 's'} in ${peakBookingsItem.month}`
                      : 'No bookings recorded in 2026'}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#10B981] rounded-xs inline-block" />
                  Peak Revenue:{'} '}
                  <strong>
                    {peakRevenueItem && peakRevenueItem.revenue > 0
                      ? `$${Number(peakRevenueItem.revenue).toLocaleString()} in ${peakRevenueItem.month}`
                      : 'No revenue recorded in 2026'}
                  </strong>
                </span>
              </div>
            </div>

            {/* 2. Pie Chart Section */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-[#003E83] dark:text-[#60a5fa]" />
                      <span>{pieMode === 'ratings' ? 'Ratings Distribution' : 'Booking Status'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      {pieMode === 'ratings' ? 'Reviews breakdown from travelers' : 'Reservation status breakdown'}
                    </p>
                  </div>
                  <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-bold">
                    <button
                      onClick={() => setPieMode('ratings')}
                      className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                        pieMode === 'ratings'
                          ? 'bg-white dark:bg-zinc-700 text-[#003E83] dark:text-white shadow-xs'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                      }`}
                    >
                      Ratings
                    </button>
                    <button
                      onClick={() => setPieMode('bookings')}
                      className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                        pieMode === 'bookings'
                          ? 'bg-white dark:bg-zinc-700 text-[#003E83] dark:text-white shadow-xs'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                      }`}
                    >
                      Bookings
                    </button>
                  </div>
                </div>

                {hasPieData ? (
                  <>
                    <div className="h-56 sm:h-60 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={78}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {activePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} wrapperStyle={{ zIndex: 50 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Donut Center Summary */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                        <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                          {pieMode === 'ratings' ? (stats.rating > 0 ? `${stats.rating}★` : '0★') : stats.total_bookings}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">
                          {pieMode === 'ratings' ? 'Average' : 'Bookings'}
                        </span>
                      </div>
                    </div>

                    {/* Slices Legend List */}
                    <div className="space-y-2 mt-2">
                      {activePieData.map((slice, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                            <span className="text-gray-700 dark:text-zinc-300 truncate font-medium">
                              {slice.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-[11px]">{slice.value}</span>
                            <span className="text-gray-900 dark:text-white font-bold min-w-[28px] text-right">
                              {slice.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-56 sm:h-60 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                    <PieChartIcon className="w-8 h-8 text-gray-300 dark:text-zinc-600 mb-2" />
                    <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                      {pieMode === 'ratings' ? 'No Reviews Yet' : 'No Bookings Yet'}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 max-w-[200px] mt-0.5">
                      {pieMode === 'ratings'
                        ? 'Tourist reviews and star ratings will automatically calculate here.'
                        : 'Customer reservations will appear in this breakdown once booked.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                  {pieMode === 'ratings'
                    ? `${stats.approved_reviews || 0} validated traveler ratings in database`
                    : `${stats.total_bookings || 0} total reservations tracked in database`}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Overview & Business Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-3 shadow-xs transition-colors">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Operational Overview for {stats.name}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                This business currently has <strong>{stats.total_services || 0} listed services</strong> and <strong>{stats.total_images || 0} promotional photos</strong>.
                {stats.pending_bookings > 0
                  ? ` You have ${stats.pending_bookings} reservation request(s) awaiting your action.`
                  : ' All received customer bookings are up to date.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  {stats.verification_status === 'approved' ? 'Verified Business Listing' : 'Pending Verification'}
                </span>
                <span>• Listing Status: <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{stats.status}</strong></span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-3 shadow-xs transition-colors">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Performance Optimization Recommendations</span>
              </h3>
              <ul className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 space-y-2 list-disc list-inside">
                {stats.pending_bookings > 0 ? (
                  <li className="text-amber-600 dark:text-amber-400 font-bold">
                    Review and confirm {stats.pending_bookings} pending customer reservation(s) in Customer Bookings.
                  </li>
                ) : (
                  <li>Maintain fast response times to keep traveler satisfaction high.</li>
                )}
                {stats.total_services === 0 ? (
                  <li className="text-blue-600 dark:text-blue-400 font-bold">
                    Add bookable packages and menus in Business Manage to attract direct customer bookings.
                  </li>
                ) : (
                  <li>Keep package details and seasonal pricing updated for incoming tourists.</li>
                )}
                {stats.total_reviews === 0 ? (
                  <li>Encourage guests who visited your establishment to leave verified ratings.</li>
                ) : (
                  <li>Respond to traveler reviews to boost your establishment profile ranking.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-2">
          <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">No Business Selected</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Please select an owned business to inspect performance analytics.</p>
        </div>
      )}
    </div>
  );
}
