import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Building2,
  DollarSign,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

export default function BusinessBookings() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();
  const { searchTerm: globalSearch } = useSearch();

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [activeBooking, setActiveBooking] = useState(null);

  const activeSearch = globalSearch || localSearch;

  const fetchBookings = useCallback((targetPage, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    const params = {
      page: targetPage,
      per_page: 15,
    };
    if (activeSearch.trim()) params.search = activeSearch.trim();
    if (statusFilter) params.status = statusFilter;
    if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (selectedBusiness?.id) params.business_id = selectedBusiness.id;

    businessOwnerService
      .getBookings(params)
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
        setIsRefreshing(false);
      });
  }, [activeSearch, statusFilter, paymentStatusFilter, dateFrom, dateTo, selectedBusiness?.id]);

  useEffect(() => {
    fetchBookings(page);
  }, [fetchBookings, page]);

  const handleConfirm = async (id) => {
    try {
      const res = await businessOwnerService.confirmBooking(id);
      if (res?.success) {
        showSuccess('Booking confirmed! Traveler has been notified.');
        fetchBookings(page);
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
        fetchBookings(page);
        if (activeBooking?.id === id) setActiveBooking(null);
      }
    } catch (err) {
      showError(err.message || 'Failed to complete booking.');
    }
  };

  const handleReject = async (id) => {
    const confirmed = await showConfirm({
      title: 'Reject Reservation',
      message: 'Decline this customer booking request?',
      confirmText: 'Reject Booking',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.rejectBooking(id, 'Capacity reached');
      if (res?.success) {
        showSuccess('Booking reservation declined.');
        fetchBookings(page);
        if (activeBooking?.id === id) setActiveBooking(null);
      }
    } catch (err) {
      showError(err.message || 'Failed to decline booking.');
    }
  };

  const resetFilters = () => {
    setLocalSearch('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
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

  // KPI stats summary
  const statsList = useMemo(() => {
    const total = pagination.total || bookings.length;
    const pending = bookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length;
    const confirmed = bookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed').length;
    const completed = bookings.filter((b) => (b.status || '').toLowerCase() === 'completed').length;

    return [
      {
        title: 'Total Bookings',
        value: total.toLocaleString(),
        subtext: 'All recorded reservations',
        icon: CalendarCheck,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
      },
      {
        title: 'Pending Review',
        value: pending.toLocaleString(),
        subtext: 'Awaiting confirmation',
        icon: Clock,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
      },
      {
        title: 'Confirmed',
        value: confirmed.toLocaleString(),
        subtext: 'Scheduled customer visits',
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      },
      {
        title: 'Completed',
        value: completed.toLocaleString(),
        subtext: 'Fulfilled reservations',
        icon: DollarSign,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
      },
    ];
  }, [pagination.total, bookings]);

  return (
    <div className="flex flex-col">
      {/* Page Header (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Customer Bookings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Review guest inquiries, confirm scheduled visits, and track reservation status.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => fetchBookings(page, true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700/60 text-gray-700 dark:text-zinc-200 text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
              title="Refresh bookings list"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, idx) => {
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar (matching tourism-admin) */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-zinc-800 shadow-xs mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search ref or guest..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#003E83] dark:focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#003E83]"
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
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#003E83]"
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
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-700 dark:text-zinc-200"
            />
          </div>

          {/* Date Range End & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-700 dark:text-zinc-200"
            />
            {(localSearch || statusFilter || paymentStatusFilter || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={resetFilters}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Reset filters"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table / List */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Retrieving booking requests..." />
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-12 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800">
          <EmptyState
            icon={CalendarCheck}
            title="No bookings match current filters"
            description="Try clearing search filters or check again when new tourist inquiries arrive."
          />
        </div>
      ) : (
        <div className="rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-zinc-800/60 text-gray-500 dark:text-zinc-400 font-semibold border-b border-gray-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Booking Ref</th>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Visit Date</th>
                  <th className="py-3 px-4">Party & Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-700 dark:text-zinc-300">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-gray-900 dark:text-white">
                      #{b.booking_reference || b.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {b.customer_name || 'Visitor'}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-zinc-500 truncate max-w-[150px]">
                        {b.customer_email || b.customer_phone || 'Direct Customer'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-800 dark:text-zinc-200 max-w-[180px] truncate">
                      {b.service?.name || b.place?.name || b.business?.name || 'Tour Service'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>{b.booking_date}</div>
                      {b.booking_time && <div className="text-[11px] text-gray-400">{b.booking_time}</div>}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>{b.guests_count || 1} guest(s)</div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        ${Number(b.total_amount || 0).toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(b.status)}>
                        {b.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {b.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirm(b.id)}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(b.id)}
                              className="px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium text-xs transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleComplete(b.id)}
                            className="px-2.5 py-1 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-xs transition cursor-pointer"
                          >
                            Complete
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveBooking(b)}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
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
          <div className="p-3.5 border-t border-gray-100 dark:border-zinc-800">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              perPage={pagination.per_page}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {activeBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setActiveBooking(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-md shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400">
                  #{activeBooking.booking_reference || activeBooking.id}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Booking Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBooking(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                <div>
                  <span className="text-gray-400 text-[11px] block">Customer Name</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeBooking.customer_name || 'Visitor'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Contact</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeBooking.customer_email || activeBooking.customer_phone || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Service Offering</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeBooking.service?.name || activeBooking.place?.name || 'Tour Offering'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Party Size</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeBooking.guests_count || 1} guest(s)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                <div>
                  <span className="text-gray-400 text-[11px] block">Booking Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeBooking.booking_date} {activeBooking.booking_time ? `@ ${activeBooking.booking_time}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Total Amount</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    ${Number(activeBooking.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Status</span>
                  <Badge variant={getStatusBadgeVariant(activeBooking.status)}>
                    {activeBooking.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Payment Status</span>
                  <span className="font-medium text-gray-700 dark:text-zinc-300 capitalize">
                    {activeBooking.payment_status || 'unpaid'}
                  </span>
                </div>
              </div>

              {activeBooking.special_requests && (
                <div className="p-3 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                  <span className="text-gray-400 text-[11px] block mb-0.5">Special Requests & Notes</span>
                  <p className="text-gray-700 dark:text-zinc-300">
                    {activeBooking.special_requests}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-zinc-800">
              {activeBooking.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleConfirm(activeBooking.id)}
                    className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(activeBooking.id)}
                    className="px-3.5 py-1.5 rounded-md border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
                  >
                    Decline
                  </button>
                </>
              )}
              {activeBooking.status === 'confirmed' && (
                <button
                  type="button"
                  onClick={() => handleComplete(activeBooking.id)}
                  className="px-3.5 py-1.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-xs transition cursor-pointer"
                >
                  Mark Completed
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveBooking(null)}
                className="px-3.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-medium cursor-pointer"
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
