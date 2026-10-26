import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Languages, 
  ArrowLeft, 
  Clock, 
  Award, 
  Sparkles,
  Loader2,
  CalendarCheck
} from 'lucide-react';
import guideService from '../../services/guideService';
import { GUIDES_DATA } from '../../data/guidesData';
import BookingModal from '../../components/common/BookingModal';
import Breadcrumb from '../../components/common/Breadcrumb';
import TourGuideCard from '../../components/common/TourGuideCard';

export default function GuideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadGuide = async () => {
      try {
        const res = await guideService.getGuide(id);
        const data = res?.data || res;
        if (data && data.name) {
          if (isMounted) setGuide(data);
          return;
        }
      } catch {
        // Fallback
      }

      const fallback = GUIDES_DATA.find(
        (g) => String(g.id) === String(id) || String(g.id).replace('guide-', '') === String(id)
      ) || GUIDES_DATA[0];

      if (isMounted) setGuide(fallback);
    };

    loadGuide().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-400 animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Loading tour guide profile...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guide Not Found</h2>
        <p className="text-gray-500">The tour guide profile you requested does not exist or has been updated.</p>
        <Link
          to="/guides"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] text-white rounded-xl font-bold text-xs"
        >
          <ArrowLeft size={14} /> Back to Guides
        </Link>
      </div>
    );
  }

  const relatedGuides = GUIDES_DATA.filter((g) => String(g.id) !== String(guide.id)).slice(0, 3);

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb Bar */}
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Guides', path: '/guides' },
              { label: guide.name },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-[#003E83] dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Tour Guides
          </button>
        </div>

        {/* Profile Card Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden shadow-sm mb-12">
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 overflow-hidden">
            <img
              src={guide.coverImage || guide.cover_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
              alt={guide.name}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 dark:bg-zinc-900/95 text-emerald-700 dark:text-emerald-400 shadow-md backdrop-blur-md border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {guide.availability || 'Available for Bookings'}
              </span>
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <div className="relative group">
                  <img
                    src={guide.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={guide.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-md" title="Ministry of Tourism Licensed">
                    <ShieldCheck size={18} />
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {guide.name}
                    </h1>
                    <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  </div>
                  <p className="text-sm font-semibold text-[#003E83] dark:text-blue-300">
                    {guide.title || 'Senior Angkor Certified Tour Guide'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 dark:text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-amber-500" />
                      {guide.province || 'Siem Reap, Cambodia'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-blue-500" />
                      {guide.experienceYears || 10}+ Years Experience
                    </span>
                    <span>•</span>
                    <span className="text-gray-400">
                      License: {guide.licenseNumber || 'MOT-KH-2016-8821'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action rate */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                <div className="text-center sm:text-right">
                  <span className="text-xs text-gray-400 uppercase font-bold block">Daily Guide Rate</span>
                  <div className="flex items-baseline justify-center sm:justify-end gap-1">
                    <span className="text-3xl font-extrabold text-[#003E83] dark:text-blue-400">
                      ${guide.dailyRate || guide.daily_rate || 45}
                    </span>
                    <span className="text-xs text-gray-500">/ day</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full sm:w-auto px-7 py-3 bg-[#003E83] hover:bg-[#002e62] text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CalendarCheck size={18} />
                  <span>Book This Guide</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-zinc-800 text-center">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Overall Rating</span>
                <div className="flex items-center justify-center gap-1 text-base font-extrabold text-gray-900 dark:text-white">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span>{guide.rating ? Number(guide.rating).toFixed(2) : '4.95'}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Traveler Reviews</span>
                <span className="text-base font-extrabold text-gray-900 dark:text-white">
                  {guide.reviewsCount || 240}+ Reviews
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Tours Guided</span>
                <span className="text-base font-extrabold text-gray-900 dark:text-white">
                  {guide.completedTours || 1200}+ Tours
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Response Time</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  Within 2 Hours
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              {/* Bio & Specialties Column */}
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    About {guide.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                    {guide.bio ||
                      'Dedicated professional tourist guide certified by the Ministry of Tourism of the Kingdom of Cambodia. With deep passion for Khmer architecture, folklore, and archaeology, I bring temple ruins and local traditions vividly to life for solo travelers, families, and photography enthusiasts alike.'}
                  </p>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" /> Guide Specialties & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(guide.specialties || [
                      'Angkor Complex Exploration',
                      'Khmer Epigraphy & History',
                      'Sunrise & Sunset Photography',
                      'Bicycle & Eco-Tourism',
                      'Culinary Market Tours',
                    ]).map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-300 font-semibold text-xs border border-blue-100 dark:border-blue-900/30"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                    <Languages size={14} className="text-blue-500" /> Languages Spoken
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(guide.languages || ['English (Fluent)', 'Khmer (Native)']).map((lang, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs font-semibold"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Badges & Certifications */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <Award size={16} className="text-amber-500" /> Official Accreditation
                  </h3>
                  <div className="space-y-3 text-xs text-gray-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                      <span>Cambodian Ministry of Tourism Official License</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Certified First Aid & Emergency Responder</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Angkor Enterprise Authorized Temple Access</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 space-y-3 text-xs text-[#003E83] dark:text-blue-300">
                  <h4 className="font-bold">Need a Full Package?</h4>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">
                    Prefer all-inclusive packages with private transport, hotel pickups, and entrance passes included?
                  </p>
                  <Link
                    to="/tours"
                    className="inline-flex items-center gap-1 font-bold text-[#003E83] dark:text-blue-400 hover:underline pt-1"
                  >
                    <span>Explore Recommended Tours & Packages</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Guides Carousel / Grid */}
        {relatedGuides.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Meet Other Top Guides
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Certified local experts in other Cambodian regions
                </p>
              </div>
              <Link
                to="/guides"
                className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
              >
                View all guides &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedGuides.map((g) => (
                <TourGuideCard
                  key={g.id}
                  guide={g}
                  onBook={(item) => {
                    setGuide(item);
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
          guide={guide}
          targetName={guide.name}
          targetType="guide"
        />
      )}
    </div>
  );
}
