import { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  Star,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Calendar,
  Users,
  Store,
  Package,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export default function BusinessDashboard() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [bookingStats, setBookingStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [businessStats, setBusinessStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.allSettled([
        businessOwnerService.getBookingStatistics(),
        businessOwnerService.getBookings({ per_page: 5 }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setBookingStats(statsRes.value.data);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.success) {
        const list = bookingsRes.value.data?.bookings || bookingsRes.value.data || [];
        setRecentBookings(Array.isArray(list) ? list : []);
      }

      if (selectedBusiness?.id) {
        const [bizStatsRes, revRes] = await Promise.allSettled([
          businessOwnerService.getStatistics(selectedBusiness.id),
          businessOwnerService.getReviews(selectedBusiness.id),
        ]);

        if (bizStatsRes.status === 'fulfilled' && bizStatsRes.value?.success) {
          setBusinessStats(bizStatsRes.value.data);
        }

        if (revRes.status === 'fulfilled' && revRes.value?.success) {
          const rList = revRes.value.data?.reviews || revRes.value.data || [];
          setRecentReviews(Array.isArray(rList) ? rList.slice(0, 3) : []);
        }
      }
    } catch (err) {
      console.warn('Error loading business dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusiness]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleConfirmBooking = async (id) => {
    try {
      const res = await businessOwnerService.confirmBooking(id);
      if (res?.success) {
        showSuccess('Reservation has been confirmed! Customer notification dispatched.');
        loadDashboardData();
      }
    } catch (err) {
      showError(err.message || 'Failed to confirm booking.');
    }
  };

  const handleRejectBooking = async (id) => {
    const confirmed = await showConfirm({
      title: 'Reject Reservation',
      message: 'Decline this customer booking request?',
      confirmText: 'Reject Booking',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.rejectBooking(id, 'Service capacity full');
      if (res?.success) {
        showSuccess('Reservation has been declined.');
        loadDashboardData();
      }
    } catch (err) {
      showError(err.message || 'Failed to reject booking.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const isVerified = selectedBusiness?.verification_status === 'approved';

  // Primary Platform KPIs (matching tourism-admin DashboardStats)
  const statsCards = [
    {
      title: 'Total Bookings',
      value: bookingStats?.total_bookings || bookingStats?.total || recentBookings.length,
      subtext: `${bookingStats?.confirmed || 0} confirmed • ${bookingStats?.pending || 0} pending`,
      change: 'Active Queue',
      trend: 'up',
      icon: CalendarCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Pending Actions',
      value: bookingStats?.pending || 0,
      subtext: 'Requires confirmation or review',
      change: bookingStats?.pending > 0 ? `${bookingStats.pending} pending` : 'All clear',
      trend: bookingStats?.pending > 0 ? 'up' : 'down',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Gross Revenue',
      value: `$${Number(bookingStats?.total_revenue || businessStats?.total_revenue || 0).toLocaleString()}`,
      subtext: 'Across completed customer bookings',
      change: '+100%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Customer Rating',
      value: `${selectedBusiness?.rating ? Number(selectedBusiness.rating).toFixed(1) : '5.0'} ★`,
      subtext: 'Based on verified customer feedback',
      change: '+0.1',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-500 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    },
  ];

  // Quick module shortcuts
  const shortcuts = [
    { name: 'Bookings Queue', path: '/business/bookings', icon: CalendarCheck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', desc: 'Process guest reservations' },
    { name: 'Listings & Services', path: '/business/listings', icon: Package, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', desc: 'Offerings & promotions' },
    { name: 'Operating Hours', path: '/business/availability', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', desc: 'Weekly schedule & hours' },
    { name: 'Customer Reviews', path: '/business/reviews', icon: Star, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', desc: 'Feedback & guest replies' },
    { name: 'Sales & Reports', path: '/business/reports', icon: BarChart3, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', desc: 'Financial CSV statements' },
    { name: 'Business Profile', path: '/business/profile', icon: Store, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40', desc: 'Identity & verification' },
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section (matching tourism-admin DashboardHeader) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Business Dashboard
              </h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Business
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {selectedBusiness?.verification_status || 'Pending Verification'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              {selectedBusiness
                ? `${selectedBusiness.name} — Real-time reservations queue, operations, and revenue overview.`
                : 'Manage your commercial listings, reservations queue, and sales reports.'}
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              to="/business/listings"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Service</span>
            </Link>
            <Link
              to="/business/profile"
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700/60 text-gray-700 dark:text-zinc-200 text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Row of 4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-md p-4 shadow-xs border border-gray-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                  {stat.subtext}
                </p>
                <div
                  className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ml-2 ${
                    stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions / Shortcuts Grid */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-3 px-1">
          Quick Management Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {shortcuts.map((sc, index) => {
            const Icon = sc.icon;
            return (
              <Link
                key={index}
                to={sc.path}
                className="bg-white dark:bg-zinc-900 rounded-md p-3.5 border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col items-start group"
              >
                <div className={`p-2 rounded-md ${sc.bg} mb-2.5 transition-transform group-hover:scale-105`}>
                  <Icon className={`w-4 h-4 ${sc.color}`} />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors">
                  {sc.name}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {sc.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Operations Split: Recent Bookings & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customer Bookings Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-zinc-800 mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Recent Customer Bookings
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Latest reservation requests requiring confirmation or processing
                </p>
              </div>
              <Link
                to="/business/bookings"
                className="text-xs font-semibold text-[#003E83] dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All Bookings</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12">
                <LoadingSpinner text="Loading bookings queue..." />
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={CalendarCheck}
                  title="No bookings received yet"
                  description="When travelers book your experiences or reserve with your business, they will appear here in real time."
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {recentBookings.map((b) => (
                  <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-zinc-400">
                          #{b.booking_reference || b.id}
                        </span>
                        <Badge variant={getStatusBadgeVariant(b.status)}>
                          {b.status}
                        </Badge>
                        <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">
                          {b.customer_name || 'Guest Explorer'}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {b.service?.name || b.place?.name || b.business?.name || 'Tourism Service Offering'}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400 shrink-0" />
                          <span>{b.booking_date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-gray-400 shrink-0" />
                          <span>{b.guests_count || 1} guest(s)</span>
                        </span>
                        {b.total_amount && (
                          <span className="font-semibold text-gray-800 dark:text-zinc-200">
                            ${Number(b.total_amount).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {b.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleConfirmBooking(b.id)}
                            className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectBooking(b.id)}
                            className="px-2.5 py-1.5 rounded-md border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/business/bookings"
                          className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-semibold transition"
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Feedback & Performance Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-zinc-800 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Customer Feedback
              </h3>
              <Link
                to="/business/reviews"
                className="text-xs font-semibold text-[#003E83] dark:text-blue-400 hover:underline"
              >
                All Reviews
              </Link>
            </div>

            {recentReviews.length === 0 ? (
              <div className="p-6 text-center rounded-md border border-dashed border-gray-200 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500">
                No customer reviews recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 dark:text-zinc-200">
                        {r.user?.name || 'Customer'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-400" />
                        <span>{r.rating || 5}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-zinc-300 line-clamp-2">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Box */}
          <div className="p-3.5 rounded-md bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs space-y-1.5">
            <span className="font-bold text-[#003E83] dark:text-blue-300 block">
              Financial Statements
            </span>
            <p className="text-gray-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Generate monthly revenue statements and download booking activity in CSV spreadsheet format.
            </p>
            <Link
              to="/business/reports"
              className="font-semibold text-[#003E83] dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-xs pt-1"
            >
              <span>Open Reports & Export</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
