import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  MapPin,
  Compass,
  ShieldCheck,
  Award,
  Users,
  Loader2,
  Sparkles,
  ChevronRight,
  Ticket,
  UserCheck
} from 'lucide-react';
import { placeService } from '../../services/placeService';
import businessService from '../../services/businessService';
import reviewService from '../../services/reviewService';
import guideService from '../../services/guideService';
import { tourService } from '../../services/tourService';
import { TOURS_DATA } from '../../data/toursData';

// Trip.com Styled Home Sections
import HomeHero from './HomeHero';
import TripCoupons from './TripCoupons';
import TripCampaignBanners from './TripCampaignBanners';
import TripInspirationCarousel from './TripInspirationCarousel';
import TripBestPlaces from './TripBestPlaces';
import TripTravelMoments from './TripTravelMoments';
import TripTrustBar from './TripTrustBar';

// Cards & Modals
import TourPackageCard from '../../components/common/TourPackageCard';
import TourGuideCard from '../../components/common/TourGuideCard';
import BookingModal from '../../components/common/BookingModal';

export default function Home() {
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [tours, setTours] = useState(TOURS_DATA);
  const [guides, setGuides] = useState([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedItemForBooking, setSelectedItemForBooking] = useState(null);
  const [bookingType, setBookingType] = useState('tour');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);

        const [placeRes, tourRes, bizRes, reviewRes, guideRes] = await Promise.allSettled([
          placeService.getPlaces({ per_page: 8, sort_by: 'rating' }),
          tourService.getTours({ per_page: 6, sort: 'popular' }),
          businessService.getBusinesses({ per_page: 8, sort: 'rating' }),
          reviewService.getReviews({ per_page: 6 }),
          guideService.getGuides({ per_page: 4, sort: 'rating' }),
        ]);

        // Process Popular Places
        if (placeRes.status === 'fulfilled') {
          const rawPlaces =
            placeRes.value?.data?.places ||
            placeRes.value?.data?.data ||
            placeRes.value?.data ||
            placeRes.value ||
            [];
          if (Array.isArray(rawPlaces)) {
            setPopularPlaces(
              rawPlaces.map((p) => ({
                id: p.id,
                name: p.name,
                province: p.province || p.province_detail?.name || 'Cambodia',
                tagline: p.description || 'Iconic Cambodian destination',
                image:
                  p.image_url ||
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
                badge: p.category || p.category_detail?.name || 'Must-Visit',
                rating: p.rating || 4.9,
                reviews_count: p.reviews_count || 1240,
                price: p.price ? p.price : undefined,
                link: `/places/${p.id}`,
              }))
            );
          }
        }

        // Process Tours
        if (tourRes.status === 'fulfilled') {
          const rawTours =
            tourRes.value?.data?.tours ||
            tourRes.value?.data ||
            tourRes.value ||
            [];
          if (Array.isArray(rawTours) && rawTours.length > 0) {
            setTours(rawTours);
          } else {
            setTours(TOURS_DATA);
          }
        } else {
          setTours(TOURS_DATA);
        }

        // Process Businesses
        if (bizRes.status === 'fulfilled') {
          const rawBiz =
            bizRes.value?.data?.businesses ||
            bizRes.value?.data?.data ||
            bizRes.value?.data ||
            bizRes.value ||
            [];
          if (Array.isArray(rawBiz)) {
            setFeaturedBusinesses(rawBiz);
          }
        }

        // Process Tour Guides
        if (guideRes.status === 'fulfilled') {
          const rawGuides =
            guideRes.value?.data?.guides ||
            guideRes.value?.data ||
            guideRes.value ||
            [];
          if (Array.isArray(rawGuides)) {
            setGuides(rawGuides.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleBookTour = (tour) => {
    setSelectedItemForBooking(tour);
    setBookingType('tour');
    setBookingModalOpen(true);
  };

  const handleBookGuide = (guide) => {
    setSelectedItemForBooking(guide);
    setBookingType('guide');
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      
      {/* 1. Trip.com Hero Banner with Multi-Tab Search Console */}
      <HomeHero />

      {/* 2. "New user exclusive" Discount Voucher Ticket Bar */}
      <TripCoupons />

      {/* 3. Promotional Campaign Banners */}
      <TripCampaignBanners />

      {/* 4. "Get inspired for your next trip" City Carousel */}
      <TripInspirationCarousel />

      {/* 5. "Places you may like" with Trip.Best Gold Emblem Badges */}
      <TripBestPlaces places={popularPlaces} />

      {/* 6. Attractions & Must-Do Tours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-extrabold text-[#287dfa] dark:bg-blue-950/60 dark:text-blue-400 mb-1">
              <Ticket size={13} />
              <span>Things to Do in Cambodia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0f294d] dark:text-white tracking-tight">
              Attractions & Must-Do Tours
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Hand-crafted guided itineraries, sunrise temple treks & island cruises with instant e-tickets.
            </p>
          </div>
          <Link
            to="/tours"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#287dfa] hover:underline"
          >
            <span>View All Packages</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {loading && tours.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-gray-200 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.slice(0, 3).map((tour) => (
              <TourPackageCard key={tour.id} tour={tour} onBook={handleBookTour} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Certified Tour Guides & Local Experts */}
      {guides.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[11px] font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 mb-1">
                <UserCheck size={13} />
                <span>Verified Local Experts</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f294d] dark:text-white tracking-tight">
                Accredited Tour Guides
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Licensed English, French, Chinese & Khmer speaking guides for temple and private journeys.
              </p>
            </div>
            <Link
              to="/guides"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#287dfa] hover:underline"
            >
              <span>Meet All Guides</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {guides.map((guide) => (
              <TourGuideCard key={guide.id} guide={guide} onBook={handleBookGuide} />
            ))}
          </div>
        </section>
      )}

      {/* 8. "Magical trip moments that last" Traveler Stories */}
      <TripTravelMoments />

      {/* 9. "Why Book With Trip.com" Trust Bar */}
      <TripTrustBar />

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        item={selectedItemForBooking}
        type={bookingType}
      />
    </div>
  );
}
