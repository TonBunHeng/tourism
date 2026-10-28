import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight,
  Star,
  X
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

export default function Bookings() {
  const { showSuccess, showError, showConfirm } = useAlert();

  const [bookings, setBookings] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);

  // Review Modal
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchBookings = () => {
    setIsLoading(true);
    travelService.getBookings()
      .then((res) => {
        if (res?.success) {
          const list = res.data?.bookings || res.data?.data || res.data || [];
          setBookings(Array.isArray(list) ? list : []);
        } else {
          setBookings([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch bookings from API:', err);
        setBookings([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showConfirm({
      title: 'Cancel Reservation',
      message: 'Are you sure you want to cancel this booking reservation in the database?',
      confirmText: 'Yes, Cancel Booking',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await travelService.cancelBooking(bookingId, 'Cancelled by tourist user');
      if (res?.success) {
        showSuccess('Your booking has been cancelled in the database.');
        fetchBookings();
        if (activeBookingDetails?.id === bookingId) {
          setActiveBookingDetails(null);
        }
      } else {
        showError(res?.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to cancel booking.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showError('Please write your review feedback.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const targetId = selectedBookingForReview?.place_id || selectedBookingForReview?.business_id;
      if (targetId) {
        await travelService.createReview({
          place_id: selectedBookingForReview.place_id,
          rating: reviewRating,
          comment: reviewComment.trim()
        });
      }
      showSuccess('Your review has been submitted to the database.', 'Review Saved');
      setSelectedBookingForReview(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      showError(err?.message || 'Unable to post review to API.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (selectedFilter === 'all') return true;
    return (b.status || '').toLowerCase() === selectedFilter;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Travel Schedule
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Bookings & Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            View reservations and bookings stored in the database.
          </p>
        </div>

        <Link
          to="/tours"
          className="px-4 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-sm transition self-start sm:self-auto"
        >
          Book New Experience
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold overflow-x-auto">
        {[
          { key: 'all', label: `All (${bookings.length})` },
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedFilter(tab.key)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              selectedFilter === tab.key
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <LoadingSpinner text="Querying database for your bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found in database"
          description="You do not have any reservations in this status category."
          action={
            <Link
              to="/tours"
              className="px-4 py-2 rounded-xl bg-[#002D62] text-white text-xs font-bold shadow-sm"
            >
              Browse Tour Packages
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    #{b.booking_reference || `BK-${b.id}`}
                  </span>
                  <Badge variant={getStatusBadgeVariant(b.status)}>
                    {b.status || 'pending'}
                  </Badge>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                  {b.service?.name || b.place?.name || b.business?.name || b.tour?.title || 'Tour Reservation'}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                    <span><strong>Date:</strong> {b.booking_date}</span>
                  </div>
                  {b.booking_time && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                      <span><strong>Time:</strong> {b.booking_time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                    <span><strong>Guests:</strong> {b.guests_count || 1} participant(s)</span>
                  </div>
                </div>

                {b.special_requests && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-[11px] text-slate-600 dark:text-zinc-400">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-0.5">Special Requests:</span>
                    <p className="line-clamp-2">{b.special_requests}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Price</div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {b.total_amount ? `$${Number(b.total_amount).toFixed(2)}` : 'Inquiry / Free'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForReview(b)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold flex items-center gap-1 transition cursor-pointer text-xs"
                    >
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>Review</span>
                    </button>
                  )}

                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveBookingDetails(b)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                    title="View Booking Details"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Experience Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Post Experience Review
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {selectedBookingForReview.service?.name || selectedBookingForReview.business?.name || 'Completed Booking'}
                </h3>
              </div>
              <button onClick={() => setSelectedBookingForReview(null)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star size={24} className={s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-zinc-700'} />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-amber-500">{reviewRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  How was your completed travel experience? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details to store in database..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForReview(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-[#002D62] text-white font-bold disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting to DB...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {activeBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  Reference: #{activeBookingDetails.booking_reference || activeBookingDetails.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Reservation Summary
                </h3>
              </div>
              <Badge variant={getStatusBadgeVariant(activeBookingDetails.status)}>
                {activeBookingDetails.status}
              </Badge>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
              <div>
                <strong>Destination / Service:</strong>{' '}
                <span className="text-slate-900 dark:text-white font-semibold">
                  {activeBookingDetails.service?.name || activeBookingDetails.place?.name || activeBookingDetails.business?.name || 'Tour'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Visit Date:</strong> {activeBookingDetails.booking_date}</div>
                <div><strong>Time:</strong> {activeBookingDetails.booking_time || 'Flexible'}</div>
              </div>
              <div><strong>Party Size:</strong> {activeBookingDetails.guests_count || 1} Person(s)</div>
              <div><strong>Payment Status:</strong> {activeBookingDetails.payment_status || 'Unpaid / At Venue'}</div>
              {activeBookingDetails.special_requests && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
                  <strong>Notes:</strong> {activeBookingDetails.special_requests}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveBookingDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-semibold text-xs"
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
