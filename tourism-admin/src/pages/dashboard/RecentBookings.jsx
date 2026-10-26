import React from 'react';
import { CalendarCheck, ArrowRight, User, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentBookings({ bookings = [], isLoading = false }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 animate-pulse">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            Completed
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const list = Array.isArray(bookings) ? bookings.slice(0, 5) : [];

  return (
    <div className={`bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col h-full transition-opacity duration-200 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <div>
          <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Recent Bookings Queue</span>
            {list.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                {list.length} Latest
              </span>
            )}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Incoming reservations & tour bookings
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/bookings')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto">
        {list.length > 0 ? (
          list.map((booking) => (
            <div
              key={booking.id}
              onClick={() => navigate('/bookings')}
              className="flex items-center justify-between gap-3 p-3 rounded-md border border-gray-100 dark:border-zinc-800/80 hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 text-[#003E83] dark:text-blue-400 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {booking.customer_name}
                    </p>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">
                      {booking.reference}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {booking.date}
                    </span>
                    <span>•</span>
                    <span>{booking.guests} {booking.guests > 1 ? 'guests' : 'guest'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1">
                <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                  {booking.currency === 'KHR' ? '៛' : '$'}{Number(booking.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {getStatusBadge(booking.status)}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarCheck className="w-10 h-10 text-gray-300 dark:text-zinc-700 mb-2" />
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
              No recent bookings found.
            </p>
            <button
              onClick={() => navigate('/bookings')}
              className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open Bookings Manager
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
