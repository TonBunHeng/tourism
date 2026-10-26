import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Heart, 
  ArrowLeft, 
  ExternalLink,
  Share2,
  Clock,
  DollarSign,
  Sun,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Compass,
  ArrowRight
} from 'lucide-react';
import { placeService } from '../../services/placeService';
import { useTravel } from '../../context/TravelContext';
import { useAuth } from '../../context/AuthContext';
import ReviewModal from '../../components/reviews/ReviewModal';
import Breadcrumb from '../../components/common/Breadcrumb';
import TourPackageCard from '../../components/common/TourPackageCard';
import BookingModal from '../../components/common/BookingModal';
import { TOURS_DATA } from '../../data/toursData';

export default function PlaceDetails() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite, showToast } = useTravel();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTourForBooking, setSelectedTourForBooking] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const recommendedTours = useMemo(() => {
    if (!place) return TOURS_DATA.slice(0, 3);
    const placeProv = (place.province || '').toLowerCase();
    const placeNm = (place.name || '').toLowerCase();

    const matched = TOURS_DATA.filter((t) => {
      const tourProv = (t.province || '').toLowerCase();
      const tourDest = (t.destination || '').toLowerCase();
      const tourDesc = (t.description || '').toLowerCase();
      return (
        tourProv.includes(placeProv) ||
        tourDest.includes(placeProv) ||
        tourDesc.includes(placeNm)
      );
    });

    if (matched.length >= 3) return matched.slice(0, 3);
    const others = TOURS_DATA.filter((t) => !matched.some((m) => m.id === t.id));
    return [...matched, ...others].slice(0, 3);
  }, [place]);

  useEffect(() => {
    let isMounted = true;
    placeService.getPlaceById(id)
      .then((res) => {
        if (!isMounted) return;
        if (res?.data) {
          setPlace(res.data);
          document.title = `${res.data.name} | AngkorVerses`;
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load destination details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-pulse space-y-6">
        <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-3xl w-full"></div>
        <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-2xl w-1/3 mx-auto"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-xl w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-zinc-800 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Destination Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400">{error || 'This attraction is unavailable or undergoing updates.'}</p>
        <Link
          to="/places"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore All Destinations</span>
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(place.id);
  const placeImage = place.image_url || place.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80';

  const mapQuery = encodeURIComponent(place.address || place.name || 'Cambodia');
  const googleMapsUrl = place.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.coordinates)}`
    : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const embedMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      <Breadcrumb
        items={[
          { label: 'Destinations', to: '/places' },
          { label: place.name }
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 text-xs font-extrabold shadow-2xs">
              {place.category || 'Attraction'}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {place.province || 'Cambodia'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {place.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">{place.address}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-2xs cursor-pointer"
            title="Share destination"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFavorite(place)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              favorited
                ? 'bg-rose-500 text-white shadow-rose-500/20 shadow-md'
                : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : 'text-rose-500'}`} />
            <span>{favorited ? 'In Wishlist' : 'Add to Wishlist'}</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('login');
              else setReviewModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Write a Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Details Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Scenery Frame */}
          <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-zinc-800 relative group">
            <div className="aspect-16/9 w-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
              <img
                src={placeImage}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-xs font-bold shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Cambodian Heritage Attraction</span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="modern-card p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Rating</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {Number(place.rating || 5.0).toFixed(1)} <span className="text-xs text-gray-400 font-normal">/ 5.0</span>
              </p>
              <span className="text-[11px] text-gray-400 mt-1">({place.reviews_count || 0} reviews)</span>
            </div>

            <div className="modern-card p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Entrance</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {place.price || 'Free Admission'}
              </p>
              <span className="text-[11px] text-gray-400 mt-1">Pass or local ticket</span>
            </div>

            <div className="modern-card p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Best Time</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {place.best_time || 'Early Morning'}
              </p>
              <span className="text-[11px] text-gray-400 mt-1">Sunrise & cooler hours</span>
            </div>

            <div className="modern-card p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Duration</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {place.duration || '2-3 Hours'}
              </p>
              <span className="text-[11px] text-gray-400 mt-1">Recommended visit</span>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>About {place.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
              {place.description || 'Discover authentic cultural history, picturesque scenery, and heritage architecture at this attraction.'}
            </p>
          </div>

          {/* Tourist Reviews Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Traveler Reviews ({place.reviews?.length || 0})
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Verified feedback from international travelers</p>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) openAuthModal('login');
                  else setReviewModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#003E83] dark:text-blue-300 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                Write Review
              </button>
            </div>

            {(!place.reviews || place.reviews.length === 0) ? (
              <div className="text-center py-10 text-gray-400 dark:text-zinc-500 space-y-2">
                <Star className="w-8 h-8 text-amber-400/50 mx-auto" />
                <p className="font-bold text-gray-700 dark:text-zinc-300 text-xs">No reviews published yet</p>
                <p className="text-[11px]">Be the first traveler to share your experience at this site.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {place.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200/70 dark:border-zinc-700/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#003E83] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                          {rev.user_name?.charAt(0) || 'T'}
                        </div>
                        <span className="text-xs font-extrabold text-gray-900 dark:text-white">{rev.user_name || 'Traveler'}</span>
                      </div>

                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-gray-200/80 dark:border-zinc-700 text-xs font-bold text-amber-500 shadow-2xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    {rev.title && (
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {rev.title}
                      </h4>
                    )}

                    <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rev.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="review"
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-zinc-700 shadow-2xs"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Location Map & Guide Booking CTA */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Location & Map Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Location & Directions</span>
            </h3>

            <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 shadow-inner">
              <iframe
                title={`Map of ${place.name}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={embedMapUrl}
              />
            </div>

            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-medium">
              {place.address}
            </p>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Book A Local Tour Guide CTA */}
          <div className="rounded-3xl bg-gradient-to-br from-[#003E83] to-blue-900 text-white p-6 shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold tracking-tight">Need a Licensed Guide?</h3>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Experience {place.name} with an accredited Ministry of Tourism guide fluent in English, French, Chinese, or Japanese.
            </p>
            <div className="pt-2">
              <Link
                to="/guides"
                className="w-full py-2.5 bg-white text-[#003E83] hover:bg-blue-50 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
              >
                <span>Find Tour Guides</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Related Tours CTA */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Travel Packages
            </h4>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Explore All-Inclusive Itineraries
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Browse curated 1-to-5 day packages including private transport, temple entry tickets, and sunrise views.
            </p>
            <Link
              to="/tours"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#003E83] dark:text-[#60a5fa] hover:underline pt-1"
            >
              <span>View Tour Packages</span>
              <span>→</span>
            </Link>
          </div>

        </div>

      </div>

      {/* Recommended Tours & Packages Section */}
      <section className="pt-8 border-t border-gray-200/80 dark:border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-[#003E83] dark:text-blue-400 mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>Guided Itineraries & Packages</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recommended Tours & Packages for {place.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              All-inclusive expeditions, certified Angkor guides, and comfortable transportation visiting {place.name}.
            </p>
          </div>
          <Link
            to="/tours"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#003E83] dark:text-blue-400 hover:underline group shrink-0"
          >
            <span>Browse All Tours & Packages</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedTours.map((tour) => (
            <TourPackageCard
              key={tour.id}
              tour={tour}
              onBook={(selected) => {
                setSelectedTourForBooking(selected);
                setBookingModalOpen(true);
              }}
            />
          ))}
        </div>
      </section>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        place={place}
        onReviewSubmitted={() => setReloadKey((k) => k + 1)}
      />

      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedTourForBooking(null);
          }}
          targetItem={selectedTourForBooking}
          type="tour"
        />
      )}
    </div>
  );
}
