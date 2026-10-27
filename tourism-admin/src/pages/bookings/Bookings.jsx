import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle, Trash2,
  Eye, Copy, Check, RefreshCw, Mail, DollarSign, ChevronDown, Building2,
  ExternalLink
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import SimplePagination from '../../components/common/SimplePagination';
import BookingDetailsModal from './BookingDetailsModal';
import BookingCancelModal from './BookingCancelModal';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { useLanguage } from '../../i18n';
import { getStatusColor } from '../../utils/StatusUtils';
import { getPageCache, setPageCache } from '../../utils/pageCache';

export default function Bookings() {
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm: search } = useSearch();

  const cachedData = getPageCache('bookings_data');
  const [bookings, setBookings] = useState(() => cachedData || []);
  const [loading, setLoading] = useState(() => !cachedData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Active state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'confirmed': return t('bookings.statusConfirmed', 'Confirmed');
      case 'completed': return t('bookings.statusCompleted', 'Completed');
      case 'cancelled': return t('bookings.statusCancelled', 'Cancelled');
      case 'pending':
      default: return t('bookings.statusPending', 'Pending');
    }
  }, [t]);

  const fetchBookings = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else if (!getPageCache('bookings_data')) setLoading(true);

    try {
      const res = await bookingService.getBookings();
      const list = res?.data?.bookings || res?.data || res || [];
      if (Array.isArray(list)) {
        const normalized = list.map((b) => ({
          ...b,
          business_name: b.business?.name || b.business_name || t('bookings.defaultPartner', 'Hospitality Partner'),
          service_name: b.service?.name || b.service_name || t('bookings.defaultService', 'Travel Experience'),
          total_price: Number(b.total_price) || 0,
          status: b.status || 'pending'
        }));
        setBookings(normalized);
        setPageCache('bookings_data', normalized);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.warn('Backend bookings fetch notice:', err.message);
      setBookings([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Copy code helper
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper to resolve public page URL
  const getVisitUrl = (booking) => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const travelBase = isLocal ? 'http://localhost:5175' : '';
    if (booking?.business_id) {
      return `${travelBase}/businesses/${booking.business_id}`;
    }
    if (booking?.tour_id) {
      return `${travelBase}/tours`;
    }
    return `${travelBase}/businesses`;
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = (search || '').toLowerCase().trim();
      const matchSearch = !q ||
        (b.booking_reference || '').toLowerCase().includes(q) ||
        (b.customer_name || '').toLowerCase().includes(q) ||
        (b.customer_email || '').toLowerCase().includes(q) ||
        (b.business_name || '').toLowerCase().includes(q) ||
        (b.service_name || '').toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    return { total, pending, confirmed, completed, cancelled, totalRevenue };
  }, [bookings]);

  // Pagination calculation
  const totalRecords = filteredBookings.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + paginatedBookings.length, totalRecords);

  // Update Status handler
  const handleUpdateStatus = async (id, newStatus, reason = '') => {
    setActionLoadingId(id);
    try {
      await bookingService.updateStatus(id, newStatus, reason);
    } catch {
      // optimistic update
    } finally {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, cancellation_reason: reason } : b));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus, cancellation_reason: reason }));
      }
      showSuccess(
        t('bookings.statusUpdatedSuccess', 'Booking status successfully changed to {status}.').replace('{status}', getStatusText(newStatus)),
        t('bookings.statusUpdatedTitle', 'Status Updated')
      );
      setActionLoadingId(null);
    }
  };

  // Submit cancel modal
  const handleCancelSubmit = async (reason) => {
    if (!bookingToCancel) return;
    await handleUpdateStatus(bookingToCancel.id, 'cancelled', reason);
    setIsCancelModalOpen(false);
    setBookingToCancel(null);
  };

  // Delete Booking
  const handleDeleteBooking = async (booking) => {
    const confirmed = await showConfirm({
      title: t('bookings.deleteTitle', 'Delete Booking Record'),
      message: t('bookings.deleteMessage', 'Are you sure you want to delete reservation "{ref}" permanently?\n\nThis action cannot be undone.').replace('{ref}', booking.booking_reference),
      confirmText: t('bookings.deleteConfirmBtn', 'Delete Record'),
      type: 'danger'
    });

    if (!confirmed) return;

    setActionLoadingId(booking.id);
    try {
      await bookingService.deleteBooking(booking.id);
    } catch {
      // optimistic update
    } finally {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking(null);
      }
      showSuccess(
        t('bookings.deletedSuccess', 'Reservation "{ref}" has been removed.').replace('{ref}', booking.booking_reference),
        t('bookings.deletedTitle', 'Booking Deleted')
      );
      setActionLoadingId(null);
    }
  };

  const statsList = [
    {
      label: t('bookings.statTotalReservations', 'Total Reservations'),
      value: (stats.total || 0).toLocaleString(),
      subtext: t('bookings.statTotalSubtext', 'Booking queue volume'),
      icon: CalendarCheck,
      color: "text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]",
      bg: "bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]"
    },
    {
      label: t('bookings.statPendingAction', 'Pending Action'),
      value: (stats.pending || 0).toLocaleString(),
      subtext: t('bookings.statPendingSubtext', 'Requires review/confirmation'),
      icon: Clock,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    },
    {
      label: t('bookings.statConfirmedBookings', 'Confirmed Bookings'),
      value: (stats.confirmed || 0).toLocaleString(),
      subtext: t('bookings.statConfirmedSubtext', 'Awaiting tourist arrival'),
      icon: CheckCircle2,
      color: "text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]",
      bg: "bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]"
    },
    {
      label: t('bookings.statGrossValue', 'Gross Transaction Value'),
      value: `$${stats.totalRevenue.toLocaleString()}`,
      subtext: t('bookings.statGrossSubtext', 'Active confirmed volume'),
      icon: DollarSign,
      color: "text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]",
      bg: "bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              {t('bookings.title', 'Bookings')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              {t('bookings.subtitle', 'Review, approve, fulfill, and monitor tourist reservations for hotels, tour packages, and travel experiences.')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, index) => {
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

      {/* Main Bookings Table Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar Header */}
        <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('bookings.allBookings', 'All Bookings')}
              </h2>
              {totalRecords !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  {totalRecords} {totalRecords === 1 ? t('bookings.bookingCountSingle', 'booking') : t('bookings.bookingCountPlural', 'bookings')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  <option value="all">{t('bookings.filterAll', 'All Bookings')}</option>
                  <option value="pending">{t('bookings.filterPending', 'Pending')}</option>
                  <option value="confirmed">{t('bookings.filterConfirmed', 'Confirmed')}</option>
                  <option value="completed">{t('bookings.filterCompleted', 'Completed')}</option>
                  <option value="cancelled">{t('bookings.filterCancelled', 'Cancelled')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                  #
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('bookings.colReference', 'REFERENCE')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('bookings.colGuestInfo', 'GUEST INFORMATION')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('bookings.colExperiencePartner', 'EXPERIENCE & PARTNER')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('bookings.colDateGuests', 'TRAVEL DATE & GUESTS')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('bookings.colTotalPrice', 'TOTAL PRICE')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('bookings.colStatus', 'STATUS')}
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('bookings.colActions', 'ACTIONS')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[var(--color-text-muted-light)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#003E83]" />
                    {t('bookings.loadingQueue', 'Loading reservations queue...')}
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 px-4">
                    <CalendarCheck className="w-12 h-12 text-[#003E83] mx-auto mb-2 opacity-80" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                      {t('bookings.noBookingsFound', 'No bookings found')}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      {t('bookings.adjustFilterPrompt', 'Try adjusting your search query or status filter')}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b, index) => {
                  const isPending = b.status === 'pending';
                  const isConfirmed = b.status === 'confirmed';
                  const isCompleted = b.status === 'completed';
                  const isCancelled = b.status === 'cancelled';

                  return (
                    <tr key={b.id} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors">
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(b.booking_reference)}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                          title={t('bookings.clickToCopy', 'Click to copy code')}
                        >
                          <span>{b.booking_reference}</span>
                          {copiedCode === b.booking_reference ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {b.customer_name || t('bookings.defaultGuest', 'Guest')}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{b.customer_email || t('bookings.noEmailProvided', 'No email provided')}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate max-w-xs">
                          {b.service_name || t('bookings.defaultService', 'Travel Experience')}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <Building2 className="w-3 h-3 text-[#003E83] dark:text-blue-400 shrink-0" />
                          <span className="truncate">{b.business_name || t('bookings.defaultPartner', 'Hospitality Partner')}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {b.booking_date}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {b.number_of_guests || 1} {b.number_of_guests === 1 ? t('bookings.guestSingle', 'Guest') : t('bookings.guestPlural', 'Guests')} • {b.booking_time || t('bookings.fullDay', 'Full day')}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          ${b.total_price}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          {b.payment_status === 'pending' ? t('bookings.pendingPayment', 'Pending') : t('bookings.paid', 'Paid')}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border capitalize ${getStatusColor(b.status)}`}>
                          {isPending && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                          {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                          {isCancelled && <XCircle className="w-3.5 h-3.5 mr-1" />}
                          {getStatusText(b.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                title={t('bookings.confirmBooking', 'Confirm Booking')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => { setBookingToCancel(b); setIsCancelModalOpen(true); }}
                                className="p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                title={t('bookings.cancelBooking', 'Cancel / Decline')}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {isConfirmed && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(b.id, 'completed')}
                                className="p-1.5 text-[#003E83] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                title={t('bookings.completeBooking', 'Complete Booking')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => { setBookingToCancel(b); setIsCancelModalOpen(true); }}
                                className="p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                title={t('bookings.cancelBooking', 'Cancel / Decline')}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('bookings.viewDetails', 'View Booking Details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={getVisitUrl(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#003E83] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer inline-flex items-center justify-center"
                            title={t('bookings.visitPublicPage', 'Visit Public Page')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('bookings.deleteBooking', 'Delete Booking')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label={t('sidebar.bookings', 'bookings')}
        />
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
          onOpenCancelModal={(b) => {
            setBookingToCancel(b);
            setIsCancelModalOpen(true);
          }}
          onDelete={handleDeleteBooking}
        />
      )}

      {/* Cancellation / Rejection Modal */}
      <BookingCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setBookingToCancel(null);
        }}
        onSubmit={handleCancelSubmit}
        booking={bookingToCancel}
      />
    </div>
  );
}
