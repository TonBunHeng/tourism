import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  ChevronLeft, 
  MessageSquare, 
  Tag, 
  PartyPopper, 
  Images, 
  X,
  Sparkles,
  Share2
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [hours, setHours] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'hours' | 'promotions' | 'events' | 'gallery' | 'reviews'

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Gallery Lightbox
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name || '');
      setCustomerEmail((prev) => prev || user.email || '');
      setCustomerPhone((prev) => prev || user.phone || '');
    }
  }, [user]);

  const loadData = useCallback(() => {
    setIsLoading(true);

    Promise.allSettled([
      travelService.getBusiness(id),
      travelService.getBusinessServices(id),
      travelService.getBusinessHours(id),
      travelService.getBusinessPromotions(id),
      travelService.getBusinessEvents(id),
      travelService.getBusinessReviews(id),
      travelService.getBusinessGallery(id),
    ])
      .then(([bRes, sRes, hRes, pRes, eRes, rRes, gRes]) => {
        if (bRes.status === 'fulfilled' && bRes.value?.success) {
          const b = bRes.value.data?.business || bRes.value.data;
          setBusiness(b);
          if (b.services && Array.isArray(b.services)) setServices(b.services);
          if (b.hours && Array.isArray(b.hours)) setHours(b.hours);
          if (b.promotions && Array.isArray(b.promotions)) setPromotions(b.promotions);
          if (b.images && Array.isArray(b.images)) setGallery(b.images);
        }

        if (sRes.status === 'fulfilled' && sRes.value?.success) {
          const s = sRes.value.data?.services || sRes.value.data;
          if (Array.isArray(s)) setServices(s);
        }

        if (hRes.status === 'fulfilled' && hRes.value?.success) {
          const h = hRes.value.data?.hours || hRes.value.data;
          if (Array.isArray(h)) setHours(h);
        }

        if (pRes.status === 'fulfilled' && pRes.value?.success) {
          const p = pRes.value.data?.promotions || pRes.value.data;
          if (Array.isArray(p)) setPromotions(p);
        }

        if (eRes.status === 'fulfilled' && eRes.value?.success) {
          const ev = eRes.value.data?.events || eRes.value.data;
          if (Array.isArray(ev)) setEvents(ev);
        }

        if (rRes.status === 'fulfilled' && rRes.value?.success) {
          const r = rRes.value.data?.reviews || rRes.value.data;
          if (Array.isArray(r)) setReviews(r);
        }

        if (gRes.status === 'fulfilled' && gRes.value?.success) {
          const g = gRes.value.data?.images || gRes.value.data;
          if (Array.isArray(g)) setGallery(g);
        }
      })
      .catch((err) => {
        console.warn('Failed to load business details:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenBooking = (service = null) => {
    setSelectedService(service || services[0] || null);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      showError('Please choose your reservation date.');
      return;
    }

    const pricePerPerson = Number(selectedService?.price || 0);
    const guestNum = Number(guestsCount) || 1;
    const totalAmount = pricePerPerson * guestNum;

    setIsSubmittingBooking(true);
    try {
      const payload = {
        business_id: Number(id),
        service_id: selectedService?.id ? Number(selectedService.id) : undefined,
        customer_name: customerName.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        booking_date: bookingDate,
        booking_time: bookingTime || '10:00',
        number_of_guests: guestNum,
        guests_count: guestNum,
        total_price: totalAmount,
        total_amount: totalAmount,
        currency: 'USD',
        special_requests: specialRequests.trim() || undefined,
      };

      const res = await travelService.createBusinessBooking(id, payload);
      if (res?.success) {
        showSuccess(
          `Your reservation has been placed successfully! Reference: ${res.data?.booking?.booking_reference || 'Confirmed'}.`,
          'Booking Confirmed'
        );
        setIsBookingModalOpen(false);
        setSpecialRequests('');
        if (isAuthenticated) {
          navigate('/bookings');
        }
      } else {
        showError(res?.message || 'Failed to submit reservation.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to place booking.');
    } finally {
      setIsSubmittingBooking(false);
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
      const res = await travelService.postBusinessReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (res?.success) {
        showSuccess('Your review has been submitted to the database.', 'Review Posted');
        setIsReviewModalOpen(false);
        setReviewComment('');
        setReviewRating(5);
        loadData();
      } else {
        showError(res?.message || 'Failed to submit review.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business?.name || 'Angkor Business',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading business details..." />;
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 size={48} className="mx-auto text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Listing Not Found</h2>
        <p className="text-sm text-slate-500">This business record could not be found or is not approved yet.</p>
        <Link to="/businesses" className="inline-block px-5 py-2.5 rounded-xl bg-[#002D62] text-white text-xs font-bold">
          Back to Directory
        </Link>
      </div>
    );
  }

  const categoryName = business.category?.name || business.category || 'Tourism Service';
  const provinceName = business.province?.name || business.province || business.address || 'Cambodia';
  const coverImage = business.cover_image_url || business.images?.[0]?.image_url || gallery?.[0]?.image_url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <div>
        <Link 
          to="/businesses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-[#002D62] dark:hover:text-blue-400 transition"
        >
          <ChevronLeft size={16} />
          <span>Back to Businesses Directory</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-100 dark:bg-zinc-800">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={business.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Building2 size={56} />
              <span className="text-xs mt-2">No Cover Photo</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#002D62]/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                {categoryName}
              </span>
              {business.price_range && (
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-bold">
                  {business.price_range}
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition cursor-pointer"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">
                {business.name}
              </h1>
              {business.verification_status === 'approved' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90">
              <div className="flex items-center gap-1">
                <Star size={15} className="fill-amber-400 text-amber-400" />
                <span className="font-bold">{Number(business.rating || 5).toFixed(1)}</span>
                <span className="text-white/70">({business.review_count || reviews.length} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-rose-400" />
                <span>{business.address || provinceName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact & Action Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-zinc-300">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 hover:text-[#002D62] dark:hover:text-blue-400">
                <Phone size={14} className="text-[#002D62] dark:text-blue-400" />
                <span>{business.phone}</span>
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="flex items-center gap-1.5 hover:text-[#002D62] dark:hover:text-blue-400">
                <Mail size={14} className="text-[#002D62] dark:text-blue-400" />
                <span>{business.email}</span>
              </a>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#002D62] dark:hover:text-blue-400">
                <Globe size={14} className="text-[#002D62] dark:text-blue-400" />
                <span>Visit Website</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Write Review</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar size={14} />
              <span>Book / Reserve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        {[
          { key: 'services', label: 'Services & Offerings', count: services.length, icon: Sparkles },
          { key: 'hours', label: 'Operating Hours', count: hours.length, icon: Clock },
          { key: 'promotions', label: 'Promotions', count: promotions.length, icon: Tag },
          { key: 'events', label: 'Events', count: events.length, icon: PartyPopper },
          { key: 'gallery', label: 'Gallery', count: gallery.length, icon: Images },
          { key: 'reviews', label: 'Reviews', count: reviews.length, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#002D62] text-[#002D62] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-[#002D62]/10 text-[#002D62] dark:bg-blue-400/20 dark:text-blue-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* About / Description section (always visible above or within tab) */}
        {business.description && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              About {business.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {business.description}
            </p>
          </div>
        )}

        {/* 1. Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Available Experiences & Services
            </h3>

            {services.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-sm text-slate-500">
                No specific services listed yet. You can still make a general reservation.
                <div className="mt-4">
                  <button
                    onClick={() => handleOpenBooking()}
                    className="px-4 py-2 rounded-xl bg-[#002D62] text-white text-xs font-bold"
                  >
                    General Reservation
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Bookable Experience
                        </span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ${Number(svc.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {svc.name}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                        {svc.description || 'Verified tourism service offered by this business.'}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                        {svc.duration && (
                          <div className="flex items-center gap-1">
                            <Clock size={13} className="text-[#002D62] dark:text-blue-400" />
                            <span>{svc.duration}</span>
                          </div>
                        )}
                        {svc.capacity && (
                          <div className="flex items-center gap-1">
                            <Users size={13} className="text-[#002D62] dark:text-blue-400" />
                            <span>Up to {svc.capacity} people</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(svc)}
                        className="w-full py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar size={14} />
                        <span>Book This Experience</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Hours Tab */}
        {activeTab === 'hours' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Weekly Operating Schedule
            </h3>

            {hours.length === 0 ? (
              <p className="text-xs text-slate-500">Contact the business directly for daily operating hours.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs sm:text-sm">
                {hours.map((h, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{h.day}</span>
                    <div>
                      {h.is_closed ? (
                        <span className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs">
                          Closed
                        </span>
                      ) : (
                        <span className="font-mono text-slate-600 dark:text-zinc-300 font-semibold">
                          {h.open_time || '08:00'} – {h.close_time || '21:00'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Active Deals & Seasonal Discounts
            </h3>

            {promotions.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-sm text-slate-500">
                No active promotional discount codes currently published. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((p) => (
                  <div
                    key={p.id}
                    className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/30 dark:via-zinc-900 dark:to-zinc-900 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase">
                        {p.discount_percentage ? `${p.discount_percentage}% OFF` : 'Special Promo'}
                      </span>
                      {p.promo_code && (
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-300 dark:border-zinc-700">
                          {p.promo_code}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {p.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                      {p.description}
                    </p>

                    {(p.start_date || p.end_date) && (
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-amber-200/60 dark:border-zinc-800">
                        Valid: {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Now'} to {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Ongoing'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Upcoming Events & Special Happenings
            </h3>

            {events.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-sm text-slate-500">
                No events currently scheduled by this establishment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="text-xs font-bold text-[#002D62] dark:text-blue-400 flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{ev.date ? new Date(ev.date).toLocaleDateString() : 'Upcoming'}</span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {ev.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {ev.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Photo Showcase
            </h3>

            {gallery.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-sm text-slate-500">
                No gallery photos uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setActivePhoto(img.image_url)}
                    className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 cursor-pointer group"
                  >
                    <img 
                      src={img.image_url} 
                      alt="Business gallery" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 text-white text-[11px] truncate">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Customer Ratings & Reviews
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-base">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    <span>{Number(business.rating || 5).toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-500">Based on {reviews.length} reviews</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#002D62] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <MessageSquare size={14} />
                <span>Submit Your Review</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-sm text-slate-500">
                No reviews yet. Be the first traveler to share your experience!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#002D62]/10 text-[#002D62] dark:bg-blue-400/20 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                          {rev.user?.name?.slice(0, 2) || rev.user_name?.slice(0, 2) || 'TR'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {rev.user?.name || rev.user_name || 'Verified Traveler'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={s <= Number(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-zinc-700'}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Business Owner Reply */}
                    {(rev.owner_reply || rev.reply) && (
                      <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border-l-4 border-[#002D62] dark:border-blue-400 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#002D62] dark:text-blue-400">
                          <CheckCircle2 size={13} />
                          <span>Response from {business.name} Owner</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 italic">
                          "{rev.owner_reply || rev.reply}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  Reservation Form
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                  Book at {business.name}
                </h3>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)}>
                <X size={18} className="text-slate-400 hover:text-slate-700 dark:hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Service Selection */}
              {services.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Select Experience / Service
                  </label>
                  <select
                    value={selectedService?.id || ''}
                    onChange={(e) => {
                      const svc = services.find((s) => String(s.id) === e.target.value);
                      setSelectedService(svc || null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  >
                    <option value="">General Visit / Standard Reservation</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — ${Number(s.price || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Guest Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Phone Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              {/* Date, Time, Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Special Notes or Dietary Requests
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Seating preferences, allergies, celebrations, pickup notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              {/* Price Calculation Box */}
              {selectedService?.price && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-zinc-400">
                    ${Number(selectedService.price).toFixed(2)} × {guestsCount} guest{guestsCount > 1 ? 's' : ''}
                  </span>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    Total: ${(Number(selectedService.price) * guestsCount).toFixed(2)} USD
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingBooking ? 'Submitting to Database...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  Verified Traveler Feedback
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  Rate {business.name}
                </h3>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-zinc-700'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {reviewRating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Your Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your dining, stay, or tour experience with this establishment..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Posting to DB...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={activePhoto} alt="Photo" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
