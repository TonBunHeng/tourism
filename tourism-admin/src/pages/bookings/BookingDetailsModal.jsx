import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  User, Mail, Phone, DollarSign,
  Clock, Users, CheckCircle2, AlertCircle, XCircle, Trash2,
  Copy, Check, X, Building2, CreditCard, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { getStatusColor } from '../../utils/StatusUtils';

export default function BookingDetailsModal({
  booking,
  onClose,
  onUpdateStatus,
  onOpenCancelModal,
  onDelete
}) {
  const { t, currentLang } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (booking) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [booking, onClose]);

  if (!booking) return null;

  const handleCopy = () => {
    if (booking.booking_reference) {
      navigator.clipboard.writeText(booking.booking_reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return t('bookings.statusConfirmed', 'Confirmed');
      case 'completed': return t('bookings.statusCompleted', 'Completed');
      case 'cancelled': return t('bookings.statusCancelled', 'Cancelled');
      case 'pending':
      default: return t('bookings.statusPending', 'Pending');
    }
  };

  const createdAt = booking.created_at ? new Date(booking.created_at) : null;
  const formattedDate = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleDateString(
      currentLang === 'KH' ? 'km-KH' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    )
    : '—';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-modal-overlay)] backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 transition-colors cursor-pointer"
                  title={t('bookings.clickToCopyRef', 'Click to copy booking reference')}
                >
                  <span>{booking.booking_reference || 'REF-PENDING'}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border capitalize ${getStatusColor(booking.status)}`}>
                  {isPending && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                  {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  {isCancelled && <XCircle className="w-3.5 h-3.5 mr-1" />}
                  {getStatusText(booking.status)}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-2">
                {t('bookings.detailsTitle', 'Reservation Details')}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('bookings.recordedOn', 'Recorded on {date}').replace('{date}', formattedDate)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {/* Service & Experience Card */}
          <div className="p-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
              {t('bookings.serviceTravelExperience', 'Service / Travel Experience')}
            </span>
            <div className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              {booking.service_name || booking.service?.name || t('bookings.defaultService', 'Travel Experience')}
            </div>
            <div className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400 shrink-0" />
              <span>{t('bookings.partnerLabel', 'Partner:')} <strong>{booking.business_name || booking.business?.name || t('bookings.defaultPartner', 'Hospitality Partner')}</strong></span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" /> {t('bookings.travelDate', 'Travel Date')}
              </span>
              <p className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">
                {booking.booking_date}
              </p>
              <span className="text-[10px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">
                {booking.booking_time || t('bookings.fullDay', 'Full Day')}
              </span>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {t('bookings.partySize', 'Party Size')}
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                {booking.number_of_guests ?? 'N/A'} {booking.number_of_guests === 1 ? t('bookings.guestSingle', 'Guest') : t('bookings.guestPlural', 'Guests')}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {t('bookings.totalPrice', 'Total Price')}
              </span>
              <p className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                ${booking.total_price}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" /> {t('bookings.payment', 'Payment')}
              </span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-1">
                {booking.payment_status === 'pending' ? t('bookings.pendingPayment', 'Pending') : t('bookings.paid', 'Paid')}
              </p>
            </div>
          </div>

          {/* Guest Contact Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('bookings.primaryTravelerContact', 'Primary Traveler Contact')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">{t('bookings.travelerName', 'Traveler Name')}</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {booking.customer_name || t('bookings.defaultGuest', 'Guest')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">{t('bookings.emailAddress', 'Email Address')}</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {booking.customer_email || t('bookings.noEmailProvided', 'No email provided')}
                  </span>
                </div>
              </div>

              {booking.customer_phone && (
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">{t('bookings.contactPhone', 'Contact Phone')}</span>
                    <span className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {booking.customer_phone}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation reason if cancelled */}
          {booking.cancellation_reason && (
            <div className="p-4 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{t('bookings.cancellationDeclineReason', 'Cancellation / Decline Reason:')}</span>
              <p className="text-xs text-rose-600 dark:text-rose-300">
                {booking.cancellation_reason}
              </p>
            </div>
          )}

          {/* Special Requests / Notes */}
          {booking.special_requests && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('bookings.specialRequestsNotes', 'Special Requests & Notes:')}
              </span>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                {booking.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] transition-colors cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(booking)}
                className="p-2 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                title={t('bookings.deleteBooking', 'Delete Booking')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <a
              href={(() => {
                const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                const travelBase = isLocal ? 'http://localhost:5175' : '';
                if (booking.business_id) return `${travelBase}/businesses/${booking.business_id}`;
                if (booking.tour_id) return `${travelBase}/tours`;
                return `${travelBase}/businesses`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[#003E83] dark:text-blue-400 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('bookings.visitPage', 'Visit Page')}</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenCancelModal?.(booking)}
                  className="px-3.5 py-2 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('bookings.cancelBooking', 'Cancel / Decline')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus?.(booking.id, 'confirmed')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('bookings.confirmBooking', 'Confirm Booking')}</span>
                </button>
              </>
            )}

            {isConfirmed && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenCancelModal?.(booking)}
                  className="px-3.5 py-2 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('bookings.cancelBooking', 'Cancel / Decline')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus?.(booking.id, 'completed')}
                  className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('bookings.markCompleted', 'Mark Completed')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
