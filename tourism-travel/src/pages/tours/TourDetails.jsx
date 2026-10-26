import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Star, 
  Users, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  Share2, 
  Heart, 
  Sparkles,
  Loader2,
  CalendarCheck
} from 'lucide-react';
import tourService from '../../services/tourService';
import { TOURS_DATA } from '../../data/toursData';
import BookingModal from '../../components/common/BookingModal';
import Breadcrumb from '../../components/common/Breadcrumb';
import TourPackageCard from '../../components/common/TourPackageCard';
import { useTravel } from '../../context/TravelContext';

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useTravel();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadTour = async () => {
      try {
        const res = await tourService.getTour(id);
        const data = res?.data || res;
        if (data && data.title) {
          if (isMounted) setTour(data);
          return;
        }
      } catch {
        // Fallback to local curated dataset
      }

      // Check fallback data
      const fallback = TOURS_DATA.find(
        (t) => String(t.id) === String(id) || String(t.id).replace('tour-', '') === String(id)
      ) || TOURS_DATA[0];

      if (isMounted) {
        setTour(fallback);
      }
    };

    loadTour().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-400 animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Loading tour package details...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Package Not Found</h2>
        <p className="text-gray-500">The tour package you requested is not currently available.</p>
        <Link
          to="/tours"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] text-white rounded-xl font-bold text-xs"
        >
          <ArrowLeft size={14} /> Back to Tours
        </Link>
      </div>
    );
  }

  const relatedTours = TOURS_DATA.filter((t) => String(t.id) !== String(tour.id)).slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: tour.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Tour link copied to clipboard!', 'success');
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    showToast(isSaved ? 'Removed from saved wishlist' : 'Added to saved wishlist!', isSaved ? 'info' : 'success');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb Bar */}
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Recommended Tours & Packages', path: '/tours' },
              { label: tour.title },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation & Action Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-[#003E83] dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:text-[#003E83] dark:hover:text-blue-400 transition-colors cursor-pointer"
              title="Share Tour"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:text-rose-600'
              }`}
              title="Save Tour"
            >
              <Heart size={16} className={isSaved ? 'fill-rose-500' : ''} />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {tour.badge && (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                {tour.badge}
              </span>
            )}
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={13} /> Certified Guided Experience
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {tour.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>{tour.rating ? Number(tour.rating).toFixed(1) : '4.9'}</span>
              <span className="text-gray-400 font-normal">({tour.reviewsCount || 120} traveler reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-amber-500" />
              <span>{tour.destination || tour.province || 'Cambodia'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-blue-500" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} className="text-purple-500" />
              <span>{tour.groupSize || 'Small Group (Max 10)'}</span>
            </div>
          </div>
        </div>

        {/* Media Frame */}
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shadow-md mb-10">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 flex items-center justify-between text-white">
            <div className="text-xs sm:text-sm font-medium drop-shadow-sm">
              Authentic Guided Tour in {tour.destination || 'Cambodia'}
            </div>
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs border border-white/20">
              High Resolution Gallery
            </span>
          </div>
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tour Overview
              </h2>
              <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                {tour.description}
              </p>
            </section>

            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Key Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 font-medium">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Day-by-Day Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#003E83] dark:text-blue-400" />
                  Itinerary Schedule
                </h2>
                <div className="space-y-3">
                  {tour.itinerary.map((dayPlan, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        selectedDay === index
                          ? 'border-[#003E83] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDay(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#003E83] text-white">
                            Day {dayPlan.day || index + 1}
                          </span>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {dayPlan.title}
                          </h3>
                        </div>
                      </div>
                      {dayPlan.description && (
                        <p className="mt-3 text-xs text-gray-600 dark:text-zinc-400 leading-relaxed pl-12">
                          {dayPlan.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusions & Exclusions */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                What's Included & Excluded
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check size={14} /> Included in Tour
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-700 dark:text-zinc-300">
                    {(tour.included || [
                      'Licensed English/Khmer Tour Guide',
                      'Air-conditioned private transportation',
                      'Chilled mineral water and cold towels',
                      'Hotel pickup & drop-off',
                    ]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50/60 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <X size={14} /> Not Included
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-600 dark:text-zinc-400">
                    {(tour.excluded || [
                      'Angkor Archaeological Park Pass / Temple Entrance Fee',
                      'Personal meals and alcoholic drinks',
                      'Gratuities and tips for driver & guide',
                      'Travel & medical insurance',
                    ]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Booking Card Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xl space-y-6">
              <div className="flex items-baseline justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold block">Starting Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#003E83] dark:text-blue-400">
                      ${tour.price}
                    </span>
                    <span className="text-xs text-gray-500">/ traveler</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    Available Today
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-800/60">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tour.duration}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-800/60">
                  <span className="text-gray-500">Group Size</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tour.groupSize || 'Up to 10 guests'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-800/60">
                  <span className="text-gray-500">Difficulty</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tour.difficulty || 'Easy / Moderate'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500">Cancellation</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Free up to 24h before</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-[#003E83] to-[#0055b3] hover:from-[#002e62] hover:to-[#004494] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Reserve Tour Package</span>
              </button>

              <div className="text-center text-[11px] text-gray-400 space-y-1">
                <p>No immediate payment required for reservation</p>
                <p>Instant booking confirmation via email</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tours Section */}
        {relatedTours.length > 0 && (
          <section className="border-t border-gray-200 dark:border-zinc-800 pt-12 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  More Recommended Tours & Packages in Cambodia
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Discover more handpicked adventures and cultural journeys
                </p>
              </div>
              <Link
                to="/tours"
                className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
              >
                View all tours &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTours.map((t) => (
                <TourPackageCard
                  key={t.id}
                  tour={t}
                  onBook={(item) => {
                    setTour(item);
                    setBookingModalOpen(true);
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          tour={tour}
          targetName={tour.title}
          targetType="tour"
        />
      )}
    </div>
  );
}
