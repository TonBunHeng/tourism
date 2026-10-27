import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CalendarCheck, 
  Search, 
  ChevronRight 
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

export default function BusinessBookings() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [activeBooking, setActiveBooking] = useState(null);

  const fetchBookings = useCallback((targetPage = page) => {
    setIsLoading(true);
    const params = {
      page: targetPage,
      per_page: 15,
    };
    if (search.trim()) params.search = search.trim();
    if (statusFilter) params.status = statusFilter;
    if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (selectedBusiness?.id) params.business_id = selectedBusiness.id;

    businessOwnerService.getBookings(params)
      .then((res) => {
        if (res?.success) {
          const list = res.data?.bookings || res.data || [];
          setBookings(Array.isArray(list) ? list : []);
          if (res.data?.pagination) {
            setPagination(res.data.pagination);
          } else if (res.meta) {
            setPagination({
              current_page: res.meta.current_page || 1,
              last_page: res.meta.last_page || 1,
              total: res.meta.total || 0,
              per_page: res.meta.per_page || 15,
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch business bookings:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, search, statusFilter, paymentStatusFilter, dateFrom, dateTo, selectedBusiness]);

  useEffect(() => {
    fetchBookings(1);
    setPage(1);
  }, [fetchBookings]);

  const handleConfirm = async (id) => {
    try {
      const res = await businessOwnerService.confirmBooking(id);
      if (res?.success) {
        showSuccess('Booking confirmed! Traveler has been notified.');
        fetchBookings();
        if (activeBooking?.id === id) setActiveBooking(null);
      }
    } catch (err) {
      showError(err.message || 'Failed to confirm booking.');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await businessOwnerService.completeBooking(id);
      if (res?.success) {
        showSuccess('Booking marked as completed! Payment recorded.');
        fetchBookings();
        if (activeBooking?.id === id) setActiveBooking(null);
      }
    } catch (err) {
      showError(err.message || 'Failed to complete booking.');
    }
  };

  const handleReject = async (id) => {
    const confirmed = await showConfirm({
      title: 'Decline Booking',
      message: 'Decline this reservation inquiry?',
      confirmText: 'Decline Booking',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.rejectBooking(id, 'Capacity unavailable');
      if (res?.success) {
        showSuccess('Reservation declined.');
        fetchBookings();
        if (activeBooking?.id === id) setActiveBooking(null);
      }
    } catch (err) {
      showError(err.message || 'Failed to decline booking.');
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
      {/* Title */}
      <div>
        <div className="text-xs font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider mb-1">
          Reservation Management
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Customer Bookings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Review guest inquiries, confirm scheduled visits, and track reservation status.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or guest name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003E83]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#003E83]"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#003E83]"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid / Pay at Venue</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200"
            />
          </div>

          {/* Date Range End */}
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table / List */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving booking requests..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings match current filters"
          description="Try clearing search filters or check again when new tourist inquiries arrive."
        />
      ) : (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200/80 dark:border-zinc-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Booking Ref</th>
                  <th className="py-3.5 px-4">Guest Details</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Visit Date</th>
                  <th className="py-3.5 px-4">Party & Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-800 dark:text-white">
                      #{b.booking_reference || b.id}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {b.customer_name || 'Visitor'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {b.customer_email || b.customer_phone || 'Direct Customer'}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white max-w-[180px] truncate">
                      {b.service?.name || b.place?.name || b.business?.name || 'Tour Service'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>{b.booking_date}</div>
                      {b.booking_time && <div className="text-[11px] text-slate-400">{b.booking_time}</div>}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>{b.guests_count || 1} guest(s)</div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        ${Number(b.total_amount || 0).toFixed(2)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(b.status)}>
                        {b.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {b.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirm(b.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(b.id)}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 font-semibold text-[11px] transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleComplete(b.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition cursor-pointer"
                          >
                            Mark Complete
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveBooking(b)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          title="View Full Booking"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              perPage={pagination.per_page}
              onPageChange={(p) => {
                setPage(p);
                fetchBookings(p);
              }}
            />
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  Ref: #{activeBooking.booking_reference || activeBooking.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Booking Details
                </h3>
              </div>
              <Badge variant={getStatusBadgeVariant(activeBooking.status)}>
                {activeBooking.status}
              </Badge>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">Customer Information</div>
                <div>Name: <strong>{activeBooking.customer_name}</strong></div>
                {activeBooking.customer_email && <div>Email: {activeBooking.customer_email}</div>}
                {activeBooking.customer_phone && <div>Phone: {activeBooking.customer_phone}</div>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>Visit Date: <strong>{activeBooking.booking_date}</strong></div>
                <div>Time: <strong>{activeBooking.booking_time || 'Flexible'}</strong></div>
                <div>Guests: <strong>{activeBooking.guests_count || 1} Person(s)</strong></div>
                <div>Payment: <strong>{activeBooking.payment_status || 'Unpaid'}</strong></div>
              </div>

              {activeBooking.special_requests && (
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                  <strong>Special Requests:</strong> {activeBooking.special_requests}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
