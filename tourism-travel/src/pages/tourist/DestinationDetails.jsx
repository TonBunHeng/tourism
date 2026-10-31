import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Heart, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Compass,
  X
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [guestsCount, setGuestsCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Review Form State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Add to Trip State
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [tripDayNumber, setTripDayNumber] = useState(1);
  const [isAddingToTrip, setIsAddingToTrip] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    travelService.getPlace(id)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          const p = res.data?.place || res.data;
          setPlace(p);
          if (p.reviews && Array.isArray(p.reviews)) {
            setReviews(p.reviews);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load place details:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // Check favorite status
    if (isAuthenticated) {
      travelService.getFavorites().then((favRes) => {
        if (favRes?.success && isMounted) {
          const favs = favRes.data?.favorites || favRes.data || [];
          const match = favs.some((f) => String(f.place_id || f.id) === String(id));
          setIsFavorite(match);
        }
      }).catch(() => {});
    }

    return () => { isMounted = false; };
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showError('Please sign in to save destinations to your personal wishlist.');
      return;
    }

    try {
      const res = await travelService.toggleFavorite(id);
      if (res?.success) {
        setIsFavorite(!isFavorite);
        showSuccess(isFavorite ? 'Removed from favorites' : 'Saved to favorites!');
      }
    } catch {
      showError('Failed to update favorite status.');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Destination link copied to clipboard!', 'Link Copied');
    }
  };

  const handleOpenAddToTrip = async () => {
    if (!isAuthenticated) {
      showError('Please sign in to add destinations to your planned trips.');
      return;
    }

    try {
      const res = await travelService.getTrips();
      if (res?.success) {
        const list = res.data?.trips || res.data?.data || res.data || [];
        setUserTrips(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0) {
          setSelectedTripId(String(list[0].id));
        }
        setIsAddToTripModalOpen(true);
      }
    } catch {
      showError('Unable to load your trips. Please try again.');
    }
  };

  const handleAddToTripSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId) {
      showError('Please select or create a trip first.');
      return;
    }

    setIsAddingToTrip(true);
    try {
      const payload = {
        place_id: place.id,
        day_number: parseInt(tripDayNumber, 10) || 1,
        activity: `Explore ${place.name}`,
        notes: `Visit ${place.name} in ${place.province?.name || 'Cambodia'}.`,
        time_slot: 'Morning',
      };

      const res = await travelService.addTripItinerary(selectedTripId, payload);
      if (res?.success) {
        showSuccess(`Added ${place.name} to your trip plan!`, 'Added to Itinerary');
        setIsAddToTripModalOpen(false);
      } else {
        showError(res?.message || 'Failed to add to trip.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to add destination to trip.');
    } finally {
      setIsAddingToTrip(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      showError('Please select a visit date.');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const count = parseInt(guestsCount, 10) || 1;
      const payload = {
        place_id: place.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        number_of_guests: count,
        guests_count: count,
        special_requests: `[Destination Visit: ${place.name}] ${specialRequests}`.trim() || undefined,
        customer_name: user?.name || 'Visitor',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
      };

      const res = await travelService.createBooking(payload);
      if (res?.success) {
        setIsBookingModalOpen(false);
        showSuccess('Your reservation inquiry has been submitted! You can view it under My Bookings.', 'Booking Confirmed');
        setSpecialRequests('');
      }
    } catch (err) {
      showError(err.message || 'Failed to submit booking inquiry. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showError('Please write your review comment.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await travelService.createReview({
        place_id: place.id,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      });

      if (res?.success) {
        setIsReviewModalOpen(false);
        showSuccess('Thank you for sharing your experience! Your review has been submitted for moderation.', 'Review Submitted');
        setReviewTitle('');
        setReviewComment('');
        // Reload reviews
        travelService.getPlace(id).then((r) => {
          if (r?.data?.reviews) setReviews(r.data.reviews);
        });
      }
    } catch (err) {
      showError(err.message || 'Failed to post review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading destination details..." />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Destination Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">The requested destination could not be retrieved from the catalog.</p>
        <Link to="/destinations" className="px-5 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-semibold">
          Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-[#002D62] dark:hover:text-blue-400 transition"
        >
          <ChevronLeft size={16} />
          <span>Back to Destinations</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition cursor-pointer text-xs flex items-center gap-1.5 font-medium"
            title="Share destination"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition cursor-pointer text-xs flex items-center gap-1.5 font-medium ${
              isFavorite
                ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50'
            }`}
          >
            <Heart size={15} className={isFavorite ? 'fill-rose-500' : ''} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Photo & Badges */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative h-[340px] sm:h-[440px] w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-lg">
            <img
              src={place.image_url || place.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#002D62] text-white shadow-md">
                {place.category?.name || (typeof place.category === 'string' ? place.category : place.category_name) || 'Heritage & Cultural'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white shadow-md">
                {place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || 'Cambodia'}
              </span>
            </div>

            {place.rating && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Star size={14} className="fill-amber-300" />
                <span>{Number(place.rating).toFixed(1)} / 5.0</span>
                <span className="text-white/70 font-normal">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          {/* Title & Location Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#002D62] dark:text-blue-400 mb-1">
              <MapPin size={15} />
              <span>{place.location || place.address || `${place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || 'Cambodia'}`}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {place.name}
            </h1>
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#002D62] dark:text-blue-400">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Hours</div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">
                  {place.opening_hours || '06:00 AM - 05:30 PM'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <DollarSign size={18} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Admission</div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">
                  {place.entrance_fee || place.price || 'Free Entry'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Status</div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">
                  {place.status || 'Active Tourist Site'}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              About this Cambodian Destination
            </h3>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed space-y-3 font-normal">
              <p>{place.description || 'A timeless destination showcasing the cultural heritage, religious history, and architecture of Cambodia.'}</p>
              {place.history && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs">
                  <span className="font-bold block text-slate-800 dark:text-zinc-200 mb-1">Historical Background</span>
                  <p>{place.history}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Booking & AI Recommendation */}
        <div className="space-y-6">
          {/* Booking Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-5 sticky top-24">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Plan Your Experience
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span>{place.entrance_fee || place.price || 'Free Admission'}</span>
                <Badge variant="success">Available</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Book a local guide or register your visit inquiry.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: window.location } });
                  } else {
                    setIsBookingModalOpen(true);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar size={16} />
                <span>Book Guided Tour / Visit</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddToTrip}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Compass size={15} className="text-[#002D62] dark:text-blue-400" />
                <span>Add to Trip Itinerary</span>
              </button>

              <Link
                to={`/ai-chat?province=${encodeURIComponent(place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || 'Siem Reap')}&prompt=${encodeURIComponent(`Tell me practical travel advice, best sunrise photo spot, and dress code for ${place.name}.`)}`}
                className="w-full py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Sparkles size={15} />
                <span>Ask AI Assistant About This Place</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Instant reservation inquiry confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Direct communication with local tourist desk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Reviews Section */}
      <section className="pt-8 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Visitor Reviews & Experiences ({reviews.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Authentic feedback from verified travelers visiting this location.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', { state: { from: window.location } });
              } else {
                setIsReviewModalOpen(true);
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-[#002D62] dark:border-blue-500 text-[#002D62] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <MessageSquare size={15} />
            <span>Write a Review</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
            <Star size={28} className="mx-auto mb-2 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">No reviews yet</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 mb-4">Be the first traveler to review {place.name}!</p>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-semibold"
            >
              Share Your Experience
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#002D62] text-white text-xs font-bold flex items-center justify-center">
                        {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rev.user?.name || 'Verified Explorer'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star size={13} className="fill-amber-400" />
                      <span>{rev.rating || 5}</span>
                    </div>
                  </div>

                  {rev.title && (
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400">
                  Reviewed on {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Book Experience at {place.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
              Submit your preferred dates and reservation preferences.
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="05:30">05:30 AM (Sunrise)</option>
                    <option value="08:00">08:00 AM (Morning Tour)</option>
                    <option value="10:30">10:30 AM (Mid-Day)</option>
                    <option value="14:00">02:00 PM (Afternoon)</option>
                    <option value="16:30">04:30 PM (Sunset)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Number of Participants
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Special Requests / Requirements
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. English-speaking tour guide, hotel pickup, vegetarian lunch options..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="flex-1 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white text-xs font-bold"
                >
                  {isSubmittingBooking ? 'Submitting...' : 'Confirm Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Review {place.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
              Rate your visit and provide advice for other tourists.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-700'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {reviewRating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Unforgettable sunrise experience!"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Your Review Comments
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on crowd levels, photography advice, admission tips, or guides..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white text-xs font-bold"
                >
                  {isSubmittingReview ? 'Posting Review...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Trip Modal */}
      {isAddToTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  Itinerary Planner
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add {place.name} to Trip
                </h3>
              </div>
              <button onClick={() => setIsAddToTripModalOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {userTrips.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-500">You don't have any planned trips yet.</p>
                <Link
                  to="/trips"
                  className="inline-block px-4 py-2 rounded-xl bg-[#002D62] text-white text-xs font-bold"
                >
                  Create a Trip First
                </Link>
              </div>
            ) : (
              <form onSubmit={handleAddToTripSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Select Planned Trip <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  >
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.destination || 'Cambodia'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Day Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={tripDayNumber}
                    onChange={(e) => setTripDayNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    e.g. Day 1, Day 2 of your trip itinerary
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddToTripModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingToTrip}
                    className="px-5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    {isAddingToTrip ? 'Adding to Trip...' : 'Add to Day Itinerary'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
