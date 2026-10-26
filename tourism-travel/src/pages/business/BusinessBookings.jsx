import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock,
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Search, 
  AlertCircle, 
  Copy, 
  Check, 
  Loader2, 
  Phone, 
  Mail,
  RefreshCw,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import businessService from '../../services/businessService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

export default function BusinessBookings() {
  const { showAlert } = useAlert();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [page, setPage] = useState(1);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, bookings.length);
  const paginatedBookings = bookings.slice(startIndex, endIndex);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingToReject, setSelectedBookingToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Load owned businesses for the filter dropdown
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await businessService.getOwnerBusinesses();
        const list = res?.data?.businesses || res?.data || res || [];
        setBusinesses(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load owned businesses for filter:', err);
      }
    };
    fetchBusinesses();
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedBusinessId) {
        params.business_id = selectedBusinessId;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const [bookingsRes, statsRes] = await Promise.all([
        bookingService.getOwnerBookings(params),
        bookingService.getBookingStatistics(selectedBusinessId ? { business_id: selectedBusinessId } : {}).catch(() => null),
      ]);

      const list = bookingsRes?.data?.bookings || bookingsRes?.data || bookingsRes || [];
      setBookings(Array.isArray(list) ? list : []);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, statusFilter, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [fetchBookings]);

  const handleCopyReference = (refText, bookingId) => {
    navigator.clipboard.writeText(refText);
    setCopiedId(bookingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirm = async (booking) => {
    setActionLoadingId(booking.id);
    try {
      await bookingService.confirmBooking(booking.id);
      showAlert({
        title: 'Booking Confirmed!',
        message: `Booking #${booking.booking_reference} has been confirmed. The customer has been notified.`,
        type: 'success',
      });
      fetchBookings();
    } catch (err) {
      showAlert({
        title: 'Confirmation Failed',
        message: err?.message || 'Failed to confirm booking.',
        type: 'danger',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (booking) => {
    setSelectedBookingToReject(booking);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedBookingToReject) return;

    setRejecting(true);
    try {
      await bookingService.rejectBooking(selectedBookingToReject.id, rejectionReason);
      showAlert({
        title: 'Booking Declined',
        message: `Booking #${selectedBookingToReject.booking_reference} has been declined.`,
        type: 'info',
      });
      setRejectModalOpen(false);
      setSelectedBookingToReject(null);
      fetchBookings();
    } catch (err) {
      showAlert({
        title: 'Decline Failed',
        message: err?.message || 'Failed to decline booking.',
        type: 'danger',
      });
    } finally {
      setRejecting(false);
    }
  };

  const handleComplete = async (booking) => {
    setActionLoadingId(booking.id);
    try {
      await bookingService.completeBooking(booking.id);
      showAlert({
        title: 'Booking Completed!',
        message: `Booking #${booking.booking_reference} marked as completed.`,
        type: 'success',
      });
      fetchBookings();
    } catch (err) {
      showAlert({
        title: 'Failed',
        message: err?.message || 'Could not update booking.',
        type: 'danger',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-gray-500" />
            Cancelled by Guest
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-bold text-[11px] rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-bold text-[11px] rounded-full flex items-center gap-1 animate-pulse">
            <Clock3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Action Required (Pending)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 pb-16 transition-colors">
      {/* Header Container */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb
            items={[
              { label: 'Business Portal', to: '/business/dashboard' },
              { label: 'Customer Bookings' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#003E83] dark:text-[#60a5fa] uppercase tracking-wider">
                Hospitality & Reservations
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Customer Bookings
              </h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Accept, confirm, or decline reservation requests from travelers visiting your businesses.
              </p>
            </div>

            <button
              onClick={fetchBookings}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Quick Metrics */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
              <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-200 dark:border-zinc-700/60 space-y-0.5">
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">Total Received</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total_bookings}</p>
              </div>
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-lg border border-amber-200/80 dark:border-amber-900/50 space-y-0.5">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Pending Acceptance</span>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.pending_bookings}</p>
              </div>
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-lg border border-blue-200/80 dark:border-blue-900/50 space-y-0.5">
                <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Confirmed</span>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats.confirmed_bookings}</p>
              </div>
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 space-y-0.5">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Completed</span>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{stats.completed_bookings}</p>
              </div>
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-lg border border-purple-200/80 dark:border-purple-900/50 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-purple-700 dark:text-purple-400 font-medium">Earned Revenue</span>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-400">${stats.total_revenue || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending Action' },
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#003E83] dark:bg-[#60a5fa] text-white dark:text-zinc-950 shadow-xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Business Select and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {businesses.length > 1 && (
              <div className="relative">
                <select
                  value={selectedBusinessId}
                  onChange={(e) => {
                    setSelectedBusinessId(e.target.value);
                    setPage(1);
                  }}
                  className="pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-[#003E83] dark:focus:border-[#60a5fa] cursor-pointer"
                >
                  <option value="">All My Businesses</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search guest or ref..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83]"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Loading customer bookings...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs text-rose-600 font-medium">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-xs font-semibold rounded-md hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-800 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Bookings Found</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
              {statusFilter !== 'all' 
                ? `No bookings with status "${statusFilter}" currently.` 
                : 'You have not received any booking requests from travelers yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedBookings.map((b) => {
              const biz = b.business || {};
              const srv = b.service || {};
              const isPending = b.status === 'pending';
              const isConfirmed = b.status === 'confirmed';
              const isProcessing = actionLoadingId === b.id;

              return (
                <div
                  key={b.id}
                  className={`bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-xs transition-all space-y-4 ${
                    isPending
                      ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-gray-200 dark:border-zinc-800'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#003E83] dark:bg-[#60a5fa] text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                        {b.customer_name?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                            {b.customer_name}
                          </h4>
                          {getStatusBadge(b.status)}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                          For business: <span className="font-semibold text-gray-800 dark:text-zinc-200">{biz.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-zinc-700 text-xs">
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
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 text-[11px] block">Service / Booking</span>
                      <span className="font-semibold text-gray-900 dark:text-white truncate block">
                        {srv.name || 'Table / Venue Visit'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[11px] block">Scheduled Date</span>
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
                      <span className="text-gray-400 text-[11px] block">Total Amount</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {b.total_price > 0 ? `$${Number(b.total_price).toFixed(2)} ${b.currency || 'USD'}` : 'Unpriced'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Contact Details */}
                  <div className="flex flex-wrap items-center gap-4 text-xs bg-gray-50/60 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    {b.customer_phone && (
                      <a
                        href={`tel:${b.customer_phone}`}
                        className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{b.customer_phone}</span>
                      </a>
                    )}

                    {b.customer_email && (
                      <a
                        href={`mailto:${b.customer_email}`}
                        className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-400 hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{b.customer_email}</span>
                      </a>
                    )}
                  </div>

                  {/* Special Requests */}
                  {b.special_requests && (
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-lg text-xs space-y-0.5">
                      <span className="font-bold text-blue-900 dark:text-blue-300">Guest Special Request:</span>
                      <p className="text-gray-700 dark:text-zinc-300">{b.special_requests}</p>
                    </div>
                  )}

                  {/* Declined / Cancelled info */}
                  {b.rejection_reason && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      <span className="font-bold">Declined reason:</span> {b.rejection_reason}
                    </p>
                  )}
                  {b.cancellation_reason && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      <span className="font-semibold">Guest cancellation note:</span> {b.cancellation_reason}
                    </p>
                  )}

                  {/* Action Buttons for Host */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-[11px] text-gray-400">
                      Received {new Date(b.created_at).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleConfirm(b)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Confirm & Accept</span>
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(b)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none px-3.5 py-2 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => handleComplete(b)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>Mark Completed</span>
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(b)}
                            disabled={isProcessing}
                            className="px-3 py-2 text-rose-600 hover:underline text-xs font-semibold cursor-pointer"
                          >
                            Cancel/Decline
                          </button>
                        </>
                      )}

                      <Link
                        to={`/business/businesses/${biz.id}`}
                        className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Business Profile</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
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
          className="rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs"
        />
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedBookingToReject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setRejectModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Decline Booking Request</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Provide a reason for declining booking <span className="font-mono font-bold text-[#003E83] dark:text-[#60a5fa]">#{selectedBookingToReject.booking_reference}</span> from {selectedBookingToReject.customer_name}.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Reason for Guest
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Fully booked on this date, private event scheduled, or table unavailable."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#003E83] dark:focus:border-[#60a5fa] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={rejecting}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {rejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
