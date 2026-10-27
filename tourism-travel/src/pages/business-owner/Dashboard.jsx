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
  Users
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

  return (
    <div className="space-y-8">
      {/* Top Banner / Business Verification Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#003E83] to-blue-800 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Merchant Operations
            </span>
            {selectedBusiness?.verification_status === 'approved' ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 size={11} /> Verified Business
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[10px] font-bold flex items-center gap-1">
                <Clock size={11} /> Verification Status: {selectedBusiness?.verification_status || 'Pending Review'}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {selectedBusiness ? selectedBusiness.name : 'Welcome to AngkorVerses Business Hub'}
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
            {selectedBusiness?.description || 'Manage your tourism offerings, receive live bookings, and review operational revenue analytics.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/business/listings"
            className="px-4 py-2.5 rounded-xl bg-white text-[#003E83] font-bold text-xs shadow-sm hover:bg-blue-50 transition flex items-center gap-1.5 shrink-0"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </Link>
          <Link
            to="/business/profile"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition shrink-0"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total Bookings</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400">
              <CalendarCheck size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {bookingStats?.total_bookings || bookingStats?.total || recentBookings.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">{bookingStats?.confirmed || 0} confirmed</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{bookingStats?.pending || 0} pending</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Pending Actions</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {bookingStats?.pending || 0}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Requires confirmation or action
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ${Number(bookingStats?.total_revenue || businessStats?.total_revenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Across completed reservations
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Customer Rating</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Star size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{selectedBusiness?.rating ? Number(selectedBusiness.rating).toFixed(1) : '5.0'}</span>
              <Star size={18} className="text-amber-400 fill-amber-400" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Based on verified customer reviews
            </div>
          </div>
        </div>
      </div>

      {/* Main Row: Recent Bookings & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Queue */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Customer Bookings
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Latest customer reservation inquiries and pending requests
              </p>
            </div>
            <Link
              to="/business/bookings"
              className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Loading bookings queue..." />
          ) : recentBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings received yet"
              description="When tourists make reservations for your business or tour services, they will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {recentBookings.map((b) => (
                <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        #{b.booking_reference || b.id}
                      </span>
                      <Badge variant={getStatusBadgeVariant(b.status)}>
                        {b.status}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                        {b.customer_name || 'Guest Explorer'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {b.service?.name || b.place?.name || b.business?.name || 'Tourism Service'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>{b.booking_date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-slate-400 shrink-0" />
                        <span>{b.guests_count || 1} guest(s)</span>
                      </span>
                      {b.total_amount && <span className="font-bold text-slate-700 dark:text-zinc-200">${Number(b.total_amount).toFixed(2)}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {b.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleConfirmBooking(b.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectBooking(b.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/business/bookings"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 text-xs font-semibold"
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

        {/* Recent Customer Reviews */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Customer Feedback
            </h3>
            <Link
              to="/business/reviews"
              className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
            >
              All Reviews
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-400">
              No customer reviews recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {r.user?.name || 'Customer'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={12} className="fill-amber-400" />
                      <span>{r.rating || 5}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-300 line-clamp-2">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2">
            <span className="font-bold text-[#003E83] dark:text-blue-300 block">Performance Reports</span>
            <p className="text-slate-600 dark:text-zinc-400">
              Download audited revenue statements and booking logs in CSV spreadsheet format.
            </p>
            <Link
              to="/business/reports"
              className="font-bold text-[#003E83] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
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
