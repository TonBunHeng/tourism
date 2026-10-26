import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle, 
  Calendar,
  CalendarCheck, 
  Heart, 
  Loader2,
  Settings
} from 'lucide-react';
import businessService from '../../services/businessService';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import ReviewModal from '../../components/reviews/ReviewModal';
import BookingModal from '../../components/booking/BookingModal';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function BusinessDetails() {
  const { id } = useParams();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToWishlist, showToast } = useTravel();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [hours, setHours] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState(null);

  const isOwner = Boolean(user && business && user.id === business.owner_id);

  const handleOpenBooking = (service = null) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (isOwner) {
      showToast?.("You are the owner of this business. Bookings can be managed in your Business Portal.", "info");
      return;
    }
    setSelectedBookingService(service);
    setIsBookingModalOpen(true);
  };

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bizRes, evtRes, rvwRes] = await Promise.all([
        businessService.getBusinessById(id),
        businessService.getBusinessEvents(id).catch(() => ({ data: [] })),
        businessService.getBusinessReviews(id).catch(() => ({ data: [] })),
      ]);

      const bizObj = bizRes?.data || bizRes;
      setBusiness(bizObj);
      setServices(bizObj?.services || []);
      setHours(bizObj?.hours || []);
      setPromotions(bizObj?.promotions || []);
      setGallery(bizObj?.images || []);
      
      const eventList = evtRes?.data?.events || evtRes?.data || evtRes || [];
      setEvents(Array.isArray(eventList) ? eventList : []);

      const reviewList = rvwRes?.data?.reviews || rvwRes?.data || rvwRes || [];
      setReviews(Array.isArray(reviewList) ? reviewList : []);
    } catch (err) {
      setError(err?.message || 'Failed to load business details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDetails();
    }
  }, [id, fetchDetails]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading business profile...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 text-center space-y-3 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Business Unavailable</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400">{error || 'Business not found or pending approval.'}</p>
        <Link to="/businesses" className="inline-block px-4 py-2 bg-[#003E83] dark:bg-[#60a5fa] dark:text-zinc-950 text-white text-xs font-semibold rounded-md">
          Back to Businesses
        </Link>
      </div>
    );
  }

  const coverUrl = business.cover_image_url || (gallery.length > 0 ? (gallery[0].image_url || gallery[0]) : null) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

  const mapsUrl = business.latitude && business.longitude 
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}` 
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address || ''}`)}`;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: `Services (${services.length})` },
    { id: 'hours', label: 'Opening Hours' },
    { id: 'promotions', label: `Promotions (${promotions.length})` },
    { id: 'events', label: `Events (${events.length})` },
    { id: 'gallery', label: `Gallery (${gallery.length})` },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <Breadcrumb
          items={[
            { label: 'Businesses', to: '/businesses' },
            { label: business.name }
          ]}
        />
      </div>
      
      {/* Hero Cover Banner */}
      <div className="relative h-72 sm:h-96 w-full bg-gray-900 overflow-hidden">
        <img src={coverUrl} alt={business.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2 flex-wrap">
              {business.category && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold rounded">
                  {business.category.name || business.category}
                </span>
              )}
              {business.verification_status === 'approved' && (
                <span className="px-2 py-0.5 bg-[#003E83] dark:bg-blue-600 backdrop-blur-md text-white text-[11px] font-semibold rounded flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified Business
                </span>
              )}
              {business.price_range && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-semibold rounded">
                  {business.price_range}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{business.name}</h1>
            <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{business.address || business.province?.name || 'Cambodia'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {isOwner ? (
              <Link
                to={`/business/businesses/${business.id}`}
                className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] text-white dark:text-zinc-950 text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Settings className="w-3.5 h-3.5" /> Manage Business
              </Link>
            ) : (
              <button
                onClick={() => handleOpenBooking()}
                className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] text-white dark:text-zinc-950 text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5" /> Book Now
              </button>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white text-gray-900 hover:bg-gray-100 text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Google Maps
            </a>
            <button
              onClick={() => addToWishlist(business)}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-md transition-colors cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-t-md transition-all border-b-2 cursor-pointer ${
                activeTab === t.id
                  ? 'border-[#003E83] dark:border-[#60a5fa] text-[#003E83] dark:text-[#60a5fa] bg-blue-50/50 dark:bg-zinc-800/50'
                  : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-3 transition-colors">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">About {business.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {business.description || 'No description provided yet.'}
                  </p>
                </div>

                {/* Featured Services Preview */}
                {services.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Services & Pricing</h3>
                      <button onClick={() => setActiveTab('services')} className="text-xs font-semibold text-[#003E83] dark:text-[#60a5fa] hover:underline cursor-pointer">View All</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.slice(0, 4).map((s) => (
                        <div key={s.id} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-gray-200 dark:border-zinc-700/60 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-gray-900 dark:text-white">{s.name}</span>
                            {s.price && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 shrink-0">${s.price}</span>}
                          </div>
                          {s.description && <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{s.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Available Services & Menu</h3>
                {services.length === 0 ? (
                  <p className="text-xs text-gray-500">No services listed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {services.map((s) => (
                      <div key={s.id} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-gray-200 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
                        <div>
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white">{s.name}</h4>
                          {s.description && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{s.description}</p>}
                          {s.duration_minutes && <span className="text-[11px] text-gray-400 mt-1 block font-medium">Duration: {s.duration_minutes} mins</span>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {s.price && (
                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded border border-emerald-200 dark:border-emerald-800/60">
                              ${s.price}
                            </span>
                          )}
                          {!isOwner && (
                            <button
                              onClick={() => handleOpenBooking(s)}
                              className="px-3 py-1 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white font-semibold text-xs rounded-md shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Book</span>
                              <CalendarCheck className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HOURS TAB */}
            {activeTab === 'hours' && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Opening Hours</h3>
                {hours.length === 0 ? (
                  <p className="text-xs text-gray-500">Hours not published yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {hours.map((h) => (
                      <div key={h.id || h.day_of_week} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize text-gray-700 dark:text-zinc-300">{h.day_of_week}</span>
                        {h.is_closed ? (
                          <span className="text-rose-500 font-bold">Closed</span>
                        ) : (
                          <span className="text-gray-900 dark:text-white">{h.open_time} - {h.close_time}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROMOTIONS TAB */}
            {activeTab === 'promotions' && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Special Offers & Discounts</h3>
                {promotions.length === 0 ? (
                  <p className="text-xs text-gray-500">No active promotions available.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {promotions.map((p) => (
                      <div key={p.id} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-amber-200 dark:border-amber-900/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Promotion</span>
                          {p.discount_percentage && (
                            <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[11px] rounded">
                              {p.discount_percentage}% OFF
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">{p.title}</h4>
                        {p.description && <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">{p.description}</p>}
                        {p.end_date && <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Valid until: {p.end_date}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === 'events' && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Upcoming Business Events</h3>
                {events.length === 0 ? (
                  <p className="text-xs text-gray-500">No upcoming events scheduled.</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((e) => (
                      <div key={e.id} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-gray-200 dark:border-zinc-700/60 flex items-start gap-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700 text-[#003E83] dark:text-[#60a5fa] rounded-md shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white">{e.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{e.description}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{e.start_date} | {e.location || 'At business venue'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Photo Gallery</h3>
                {gallery.length === 0 ? (
                  <p className="text-xs text-gray-500">No gallery photos uploaded.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((g, idx) => (
                      <div key={g.id || idx} className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                        <img src={g.image_url || g} alt={g.caption || 'Business photo'} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span className="font-bold text-xs text-gray-900 dark:text-white ml-1">{Number(business.rating || 0).toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) openAuthModal('login');
                      else setIsReviewModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Review Items */}
                {reviews.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">Be the first to review this business!</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-4 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#003E83] dark:bg-[#60a5fa] text-white dark:text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                              {r.user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-xs text-gray-900 dark:text-white">{r.user?.name || 'Tourist'}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-xs font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{r.rating}.0</span>
                          </div>
                        </div>
                        {r.title && <h5 className="font-bold text-xs text-gray-800 dark:text-zinc-200">{r.title}</h5>}
                        <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">{r.comment}</p>

                        {/* Owner Replies */}
                        {r.replies && r.replies.length > 0 && (
                          <div className="mt-3 pl-3 border-l-2 border-[#003E83] dark:border-[#60a5fa] bg-white dark:bg-zinc-800 p-2.5 rounded-r-md space-y-1">
                            <span className="text-[10px] font-bold uppercase text-[#003E83] dark:text-[#60a5fa]">Response from Business Owner</span>
                            {r.replies.map((reply) => (
                              <p key={reply.id} className="text-xs text-gray-700 dark:text-zinc-300">{reply.reply}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Info Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-4 transition-colors">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-zinc-800">
                Business Contact & Info
              </h4>

              {business.phone && (
                <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-zinc-300">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{business.phone}</span>
                </div>
              )}

              {business.email && (
                <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-zinc-300">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{business.email}</span>
                </div>
              )}

              {business.website && (
                <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-zinc-300">
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <a href={business.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                    {business.website}
                  </a>
                </div>
              )}

              <div className="pt-2 space-y-2">
                {isOwner ? (
                  <Link
                    to={`/business/businesses/${business.id}`}
                    className="w-full py-2.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-bold rounded-md shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Settings className="w-4 h-4" /> Manage Business
                  </Link>
                ) : (
                  <button
                    onClick={() => handleOpenBooking()}
                    className="w-full py-2.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-bold rounded-md shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" /> Make a Booking
                  </button>
                )}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" /> Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedBookingService(null);
          }}
          business={business}
          initialService={selectedBookingService}
          onSuccess={fetchDetails}
        />
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          businessId={business.id}
          onSuccess={fetchDetails}
        />
      )}
    </div>
  );
}
