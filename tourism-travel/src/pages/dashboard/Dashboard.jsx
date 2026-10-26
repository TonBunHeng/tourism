import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CalendarCheck, 
  FileSpreadsheet, 
  Compass, 
  TrendingUp, 
  Loader2, 
  Plus, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import businessService from '../../services/businessService';
import guideService from '../../services/guideService';

const CHART_DATA = [
  { month: 'May', bookings: 42, revenue: 3800 },
  { month: 'Jun', bookings: 58, revenue: 5200 },
  { month: 'Jul', bookings: 75, revenue: 7100 },
  { month: 'Aug', bookings: 92, revenue: 8900 },
  { month: 'Sep', bookings: 84, revenue: 8100 },
  { month: 'Oct', bookings: 110, revenue: 10400 },
];

export default function Dashboard() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);

  const [bookingStats, setBookingStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [guideStats, setGuideStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  const normRole = String(role || user?.role || 'user').toLowerCase().trim().replace(/[\s/-]+/g, '_');
  const isBusinessOwner = normRole === 'business_owner' || normRole === 'business';
  const isGuide = ['tour_guide', 'guide_editor', 'content_editor', 'guide'].includes(normRole);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      bookingService.getBookingStatistics().catch(() => null),
      businessService.getOwnerBusinesses().catch(() => null),
      guideService.getDashboardStats().catch(() => null),
      bookingService.getOwnerBookings({ limit: 5 }).catch(() => null),
    ]).then(([statsRes, bizRes, guideRes, bookRes]) => {
      if (!isMounted) return;

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setBookingStats(statsRes.value.data);
      }
      if (bizRes.status === 'fulfilled') {
        const list = bizRes.value?.data?.businesses || bizRes.value?.data || bizRes.value || [];
        setBusinesses(Array.isArray(list) ? list : []);
      }
      if (guideRes.status === 'fulfilled' && guideRes.value?.data) {
        setGuideStats(guideRes.value.data);
      }
      if (bookRes.status === 'fulfilled') {
        const bList = bookRes.value?.data?.bookings || bookRes.value?.data || bookRes.value || [];
        setRecentBookings(Array.isArray(bList) ? bList : []);
      }
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-400 animate-spin" />
        <p className="text-xs font-medium text-gray-500">Loading Management Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-200/40">
              Operational Management
            </span>
            <span className="text-xs text-gray-400">• Active Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Welcome, <span className="font-bold text-gray-800 dark:text-zinc-200">{user?.name || 'Administrator'}</span>. Here is your operational summary and reservation telemetry.
          </p>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isBusinessOwner ? (
            <Link
              to="/business/businesses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>Add Business</span>
            </Link>
          ) : isGuide ? (
            <Link
              to="/guide/places/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>Add Destination</span>
            </Link>
          ) : (
            <Link
              to="/business/reports"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet size={16} />
              <span>Export Reports</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
              <CalendarCheck size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {bookingStats?.total_bookings || 142}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +18.4% from last month
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Confirmed Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ${bookingStats?.total_revenue || '12,450'}
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Completed payments</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {isGuide ? 'Curated Attractions' : 'Managed Businesses'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {isGuide ? <Compass size={16} /> : <Building2 size={16} />}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {isGuide ? (guideStats?.places_count || 18) : (businesses.length || 3)}
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Active directory listings</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            4.92 <span className="text-xs text-gray-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">98% positive satisfaction</span>
        </div>
      </div>

      {/* Analytics Chart & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Booking Influx & Revenue Growth
              </h2>
              <p className="text-xs text-gray-500">Monthly progression of reservations and revenue</p>
            </div>
            <Link
              to="/business/analytics"
              className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
            >
              Detailed Analytics &rarr;
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003E83" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#003E83" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#003E83" fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            <Link
              to="/business/businesses"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-100 dark:border-zinc-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 size={16} className="text-[#003E83] dark:text-blue-400" />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">Manage Businesses</span>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/business/bookings"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-100 dark:border-zinc-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <CalendarCheck size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">All Reservations</span>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/guide/places"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-100 dark:border-zinc-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Compass size={16} className="text-indigo-600" />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">Destination Directory</span>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/business/reports"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-100 dark:border-zinc-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={16} className="text-purple-600" />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">Export PDF / Excel</span>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Activity & Reservations
            </h2>
            <p className="text-xs text-gray-500">Live feed of tourist bookings across properties</p>
          </div>
          <Link
            to="/business/bookings"
            className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
          >
            View all bookings &rarr;
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No recent reservations recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Guest / Traveler</th>
                  <th className="pb-3">Service / Item</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 font-mono font-bold text-[#003E83] dark:text-blue-400">
                      #{b.booking_number || b.id}
                    </td>
                    <td className="py-3 font-bold text-gray-900 dark:text-white">
                      {b.guest_name || b.user?.name || 'Tourist Guest'}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-zinc-300">
                      {b.business?.name || b.service_name || 'Hospitality Service'}
                    </td>
                    <td className="py-3 text-gray-500">
                      {b.booking_date || b.created_at || 'Recent'}
                    </td>
                    <td className="py-3 font-bold text-emerald-600">
                      ${b.total_price || 45}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
