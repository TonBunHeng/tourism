import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarCheck, User, Mail, Phone, MapPin, DollarSign,
  Clock, Users, CheckCircle2, AlertCircle, XCircle, Trash2,
  Copy, Check, X, Building2, CreditCard, ExternalLink
} from 'lucide-react';
import { getStatusColor } from '../../utils/StatusUtils';

export default function BookingDetailsModal({
  booking,
  onClose,
  onUpdateStatus,
  onOpenCancelModal,
  onDelete
}) {
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
                  title="Click to copy booking reference"
                >
                  <span>{booking.booking_reference || 'REF-PENDING'}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border capitalize ${getStatusColor(booking.status)}`}>
                  {isPending && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                  {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  {isCancelled && <XCircle className="w-3.5 h-3.5 mr-1" />}
                  {booking.status}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-2">
                Reservation Details
              </h2>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                Recorded on {new Date(booking.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
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
              Service / Travel Experience
            </span>
            <div className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              {booking.service_name || booking.service?.name || 'Curated Cambodian Experience'}
            </div>
            <div className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400 shrink-0" />
              <span>Partner: <strong>{booking.business_name || booking.business?.name || 'Hospitality Partner'}</strong></span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" /> Travel Date
              </span>
              <p className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">
                {booking.booking_date}
              </p>
              <span className="text-[10px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">
                {booking.booking_time || 'Full Day'}
              </span>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Party Size
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                {booking.number_of_guests || 1} {booking.number_of_guests === 1 ? 'Guest' : 'Guests'}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Total Price
              </span>
              <p className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                ${booking.total_price}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Payment
              </span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-1">
                {booking.payment_status || 'Paid'}
              </p>
            </div>
          </div>

          {/* Guest Contact Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Primary Traveler Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">Traveler Name</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {booking.customer_name || 'Guest'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">Email Address</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {booking.customer_email || 'No email provided'}
                  </span>
                </div>
              </div>

              {booking.customer_phone && (
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">Contact Phone</span>
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
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Cancellation / Decline Reason:</span>
              <p className="text-xs text-rose-600 dark:text-rose-300">
                {booking.cancellation_reason}
              </p>
            </div>
          )}

          {/* Special Requests / Notes */}
          {booking.special_requests && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                Special Requests & Notes:
              </span>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                {booking.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
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
              className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Page</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
