import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock,
  MapPin, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Search, 
  AlertCircle, 
  Copy, 
  Check, 
  Loader2, 
  ExternalLink,
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

export default function MyBookings() {
  const { showAlert } = useAlert();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [page, setPage] = useState(1);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, bookings.length);
  const paginatedBookings = bookings.slice(startIndex, endIndex);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await bookingService.getMyBookings(params);
      const list = res?.data?.bookings || res?.data || res || [];
      setBookings(Array.isArray(list) ? list : []);
      if (res?.data?.statistics) {
        setStats(res.data.statistics);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [fetchBookings]);

  const handleCopyReference = (refText, bookingId) => {
    navigator.clipboard.writeText(refText);
    setCopiedId(bookingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancellationReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;

    setCancelling(true);
    try {
      await bookingService.cancelBooking(selectedBookingToCancel.id, cancellationReason);
      showAlert({
        title: 'Booking Cancelled',
        message: `Booking #${selectedBookingToCancel.booking_reference} has been cancelled.`,
        type: 'info',
      });
      setCancelModalOpen(false);
      setSelectedBookingToCancel(null);
      fetchBookings();
    } catch (err) {
      showAlert({
        title: 'Cancellation Failed',
        message: err?.message || 'Could not cancel booking.',
        type: 'danger',
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-gray-500" />
            Cancelled
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <Clock3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Pending Confirmation
          </span>
        );
    }
  };

  const pendingCount = stats ? stats.pending : bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = stats ? stats.confirmed : bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = stats ? stats.completed : bookings.filter(b => b.status === 'completed').length;
  const totalCount = stats ? stats.total : bookings.length;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 pb-16 transition-colors">
      {/* Header Container with Modern Hero */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'My Bookings' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Travel Reservations & Orders</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                My Bookings & Reservations
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1 max-w-xl">
                Track and manage your upcoming reservations with local Cambodian businesses and tour operators.
              </p>
            </div>

            <Link
              to="/businesses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-900/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Explore Businesses</span>
            </Link>
          </div>

          {/* Quick Modern Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
            <div className="p-4 bg-white dark:bg-zinc-800/80 rounded-2xl border border-gray-200/80 dark:border-zinc-700/70 shadow-2xs space-y-1">
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold">Total Bookings</span>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{totalCount}</p>
            </div>
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-2xs space-y-1">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Pending Requests</span>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 tracking-tight">{pendingCount}</p>
            </div>
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-2xs space-y-1">
              <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Confirmed Visits</span>
              <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">{confirmedCount}</p>
            </div>
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-2xs space-y-1">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Completed</span>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Capsule Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
              { id: 'rejected', label: 'Declined' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#003E83] dark:bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference or business..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#003E83] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#003E83]/20 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-400 animate-spin" />
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs text-rose-600 font-semibold">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-xs font-bold rounded-xl hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-14 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto border border-blue-100 dark:border-zinc-700">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Bookings Found</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                {statusFilter !== 'all' 
                  ? `You have no ${statusFilter} bookings at this moment.`
                  : 'You have not booked any hotels, restaurants, or tour services yet.'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-900/20 active:scale-95 transition-all"
              >
                <span>Browse Recommended Tours & Packages</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/businesses"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-2xl transition-all"
              >
                <span>Browse Tourism Businesses</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedBookings.map((b) => {
              const biz = b.business || {};
              const srv = b.service || {};
              const coverImg = biz.cover_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
              const canCancel = b.status === 'pending' || b.status === 'confirmed';

              return (
                <div
                  key={b.id}
                  className="modern-card bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all flex flex-col lg:flex-row gap-6"
                >
                  {/* Business Thumbnail */}
                  <div className="w-full lg:w-48 h-40 lg:h-auto rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-800 relative">
                    <img
                      src={coverImg}
                      alt={biz.name || 'Business'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      {biz.category && (
                        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] rounded-full">
                          {biz.category.name || 'Business'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                              {biz.name || 'Business Name'}
                            </h3>
                            {getStatusBadge(b.status)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{biz.address || biz.province?.name || 'Cambodia'}</span>
                          </p>
                        </div>

                        {/* Reference code */}
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-gray-200 dark:border-zinc-700 text-xs self-start">
                          <span className="text-gray-400 font-medium text-[11px]">Ref:</span>
                          <span className="font-mono font-bold text-[#003E83] dark:text-[#60a5fa]">{b.booking_reference}</span>
                          <button
                            onClick={() => handleCopyReference(b.booking_reference, b.id)}
                            className="p-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Copy Reference"
                          >
                            {copiedId === b.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Service / Reservation Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
                        <div>
                          <span className="text-gray-400 text-[11px] block">Service / Item</span>
                          <span className="font-semibold text-gray-900 dark:text-white truncate block">
                            {srv.name || 'General Reservation'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[11px] block">Date</span>
                          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#003E83] dark:text-[#60a5fa]" />
                            {b.booking_date}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[11px] block">Time & Party</span>
                          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            {b.booking_time || 'Anytime'} • {b.number_of_guests} guest(s)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[11px] block">Price</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {b.total_price > 0 ? `$${Number(b.total_price).toFixed(2)} ${b.currency || 'USD'}` : 'Free / Table Only'}
                          </span>
                        </div>
                      </div>

                      {/* Notes / Special Requests */}
                      {b.special_requests && (
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-2 bg-gray-50/50 dark:bg-zinc-800/40 p-2 rounded border border-gray-100 dark:border-zinc-800">
                          <span className="font-semibold">Special Request:</span> {b.special_requests}
                        </p>
                      )}

                      {/* Rejection / Cancellation Notes */}
                      {b.rejection_reason && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded border border-rose-200 dark:border-rose-900/40">
                          <span className="font-bold">Declined Reason:</span> {b.rejection_reason}
                        </p>
                      )}
                      {b.cancellation_reason && (
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-2 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded border border-gray-200 dark:border-zinc-700">
                          <span className="font-semibold">Cancellation Note:</span> {b.cancellation_reason}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                      <span className="text-xs text-gray-400 font-medium">
                        Booked on {new Date(b.created_at).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {canCancel && (
                          <button
                            onClick={() => handleOpenCancelModal(b)}
                            className="px-4 py-2 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel Booking
                          </button>
                        )}

                        <Link
                          to={`/businesses/${biz.id}`}
                          className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <span>Business Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Standard Pagination */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={bookings.length}
          label="bookings"
        />

        {/* Explore Recommended Tours & Packages Discovery Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 border border-blue-100 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Planning Your Next Journey?</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Explore Recommended Tours & Packages
            </h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
              Discover Angkor temple sunrise circuits, Mekong sunset river cruises, and pristine island retreats with instant reservations and certified guides.
            </p>
          </div>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold transition-all shadow-md shrink-0 self-start md:self-center"
          >
            <span>View All Packages</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Modern Cancellation Confirmation Modal */}
      {cancelModalOpen && selectedBookingToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-7 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Cancel Confirmation
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Cancel Booking Request?</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Are you sure you want to cancel booking <span className="font-mono font-bold text-[#003E83] dark:text-blue-400">#{selectedBookingToCancel.booking_reference}</span>? The merchant will be notified immediately.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Change of schedule, personal reasons, travel dates changed..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
