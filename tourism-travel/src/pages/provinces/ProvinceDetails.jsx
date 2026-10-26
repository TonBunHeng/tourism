import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Search, 
  Compass, 
  Users, 
  Maximize2, 
  Calendar, 
  Sparkles, 
  Building2, 
  Loader2,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { provinceService } from '../../services/provinceService';
import { useTravel } from '../../context/TravelContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import PlaceCard from '../../components/common/PlaceCard';
import EventCard from '../../components/common/EventCard';
import EventDetailsModal from '../events/EventDetailsModal';
import TourPackageCard from '../../components/common/TourPackageCard';
import BookingModal from '../../components/common/BookingModal';
import { TOURS_DATA } from '../../data/toursData';

export default function ProvinceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { provinces } = useTravel();

  const [province, setProvince] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state for places
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'reviews' | 'name'

  // Event modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Booking modal state for tour packages
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTourForBooking, setSelectedTourForBooking] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProvince = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await provinceService.getProvinceById(id);
        if (isMounted) {
          if (res?.data) {
            setProvince(res.data);
          } else {
            setError('Province information could not be found.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load province details:', err);
          setError(err?.message || 'Failed to load province details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProvince();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const places = province?.places;

  // Derived categories from the places in this province
  const availableCategories = useMemo(() => {
    if (!places || !Array.isArray(places)) return ['All'];
    const cats = new Set(['All']);
    places.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [places]);

  // Filtered and sorted places in this province
  const filteredPlaces = useMemo(() => {
    if (!places || !Array.isArray(places)) return [];

    return places
      .filter((place) => {
        const matchesSearch =
          !searchQuery.trim() ||
          place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.address?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All' || place.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        }
        if (sortBy === 'reviews') {
          return (Number(b.reviews_count) || 0) - (Number(a.reviews_count) || 0);
        }
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
      });
  }, [places, searchQuery, selectedCategory, sortBy]);

  // Other suggested provinces
  const otherProvinces = useMemo(() => {
    if (!provinces || !Array.isArray(provinces)) return [];
    return provinces.filter((p) => String(p.id) !== String(id)).slice(0, 4);
  }, [provinces, id]);

  // Recommended tours for this province
  const provinceTours = useMemo(() => {
    if (!province?.name) return TOURS_DATA.slice(0, 3);
    const provName = province.name.toLowerCase();
    const matched = TOURS_DATA.filter(
      (t) =>
        (t.province || '').toLowerCase().includes(provName) ||
        (t.destination || '').toLowerCase().includes(provName) ||
        (t.description || '').toLowerCase().includes(provName)
    );
    if (matched.length >= 3) return matched.slice(0, 3);
    const others = TOURS_DATA.filter((t) => !matched.some((m) => m.id === t.id));
    return [...matched, ...others].slice(0, 3);
  }, [province]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-9 h-9 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">
          Loading province attractions & details...
        </p>
      </div>
    );
  }

  if (error || !province) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Province Not Found
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
          {error || 'We could not find the destination you requested. Please check the province directory.'}
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/provinces')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] text-white dark:text-zinc-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Provinces
          </button>
        </div>
      </div>
    );
  }

  const mapQuery = encodeURIComponent(`${province.name}, Cambodia`);
  const embedMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <Breadcrumb
          items={[
            { label: 'Provinces', to: '/provinces' },
            { label: province.name }
          ]}
        />
        <Link
          to="/provinces"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-[#003E83] dark:hover:text-[#60a5fa] transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to 25 Provinces
        </Link>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Province Information (Left 7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-[#003E83]/10 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                  {province.type || 'Province'} of Cambodia
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{Number(province.rating || 4.9).toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400 font-normal">Rating</span>
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {province.name}
                </h1>
                <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mt-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Kingdom of Cambodia</span>
                </p>
              </div>

              {province.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed pt-1 font-normal">
                  {province.description}
                </p>
              )}
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="bg-gray-50/80 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>Attractions</span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {province.places_count ?? province.places?.length ?? 0}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>Population</span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                  {province.population || 'N/A'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-[11px]">
                  <Maximize2 className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>Total Area</span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                  {province.area || 'N/A'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>Districts</span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {province.districts_count || 1}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] text-white dark:text-zinc-950 text-xs font-semibold shadow-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                View on Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="#attractions-section"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Explore {filteredPlaces.length} Attractions
              </a>
            </div>
          </div>

          {/* Interactive Google Map (Right 5 cols) */}
          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800">
            <iframe
              title={`Map of ${province.name}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={embedMapUrl}
              className="w-full h-full min-h-[300px]"
            />
            <div className="absolute top-3 right-3 z-10">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white/95 dark:bg-zinc-900/95 text-gray-800 dark:text-zinc-200 shadow-md border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              >
                <MapPin className="w-3 h-3 text-[#003E83] dark:text-[#60a5fa]" />
                <span>Full Map</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Attractions Section */}
      <section id="attractions-section" className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Explore Attractions in {province.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#003E83]/10 dark:bg-[#60a5fa]/20 text-[#003E83] dark:text-[#60a5fa]">
                {filteredPlaces.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Heritage temples, natural wonders, and iconic sights situated across {province.name}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md px-3 py-1.5 text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#003E83] dark:focus:ring-[#60a5fa] cursor-pointer"
            >
              <option value="rating">Top Rated ⭐</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Local Search and Category Filter Toolbar */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder={`Search places in ${province.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#003E83] dark:focus:ring-[#60a5fa] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          {availableCategories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Category:
              </span>
              {availableCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#003E83] text-white dark:bg-[#60a5fa] dark:text-zinc-950 shadow-xs'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Places Grid */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              No matching attractions found
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
              We could not find any attractions in {province.name} matching your search or category filter.
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-1.5 bg-[#003E83] dark:bg-[#60a5fa] text-white dark:text-zinc-950 text-xs font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Upcoming Events in Province */}
      {province.events && province.events.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#003E83] dark:text-[#60a5fa]" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Upcoming Festivals & Events in {province.name}
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Join cultural celebrations, sports events, and gatherings hosted in {province.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {province.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={(ev) => {
                  setSelectedEvent(ev);
                  setEventModalOpen(false);
                  setTimeout(() => setEventModalOpen(true), 10);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Tours & Packages in Province */}
      <section className="space-y-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Recommended Tours & Packages in {province.name}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Curated travel packages, guided excursions, and day trips exploring {province.name}
            </p>
          </div>
          <Link
            to="/tours"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#003E83] dark:text-[#60a5fa] hover:underline"
          >
            <span>All Recommended Tours</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provinceTours.map((t) => (
            <TourPackageCard
              key={t.id}
              tour={t}
              onBook={(selected) => {
                setSelectedTourForBooking(selected);
                setBookingModalOpen(true);
              }}
            />
          ))}
        </div>
      </section>

      {/* Travel Tips & Highlights */}
      <section className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-zinc-900 dark:to-zinc-800/80 border border-blue-100 dark:border-zinc-800 rounded-xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#003E83] dark:text-[#60a5fa]" />
          Traveler Tips for Visiting {province.name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-zinc-300">
          <div className="bg-white/80 dark:bg-zinc-900/80 p-4 rounded-lg border border-blue-100/60 dark:border-zinc-700/60 space-y-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Best Time to Visit
            </h4>
            <p className="leading-relaxed">
              The dry season from November to April offers comfortable temperatures, clear skies, and optimal conditions for exploration.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 p-4 rounded-lg border border-blue-100/60 dark:border-zinc-700/60 space-y-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Getting Around
            </h4>
            <p className="leading-relaxed">
              Tuk-tuks, local remorques, bicycles, and rental scooters are readily available across provincial town centers and attractions.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 p-4 rounded-lg border border-blue-100/60 dark:border-zinc-700/60 space-y-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cultural Etiquette
            </h4>
            <p className="leading-relaxed">
              When visiting temples and religious grounds, please dress modestly covering shoulders and knees out of respect for local customs.
            </p>
          </div>
        </div>
      </section>

      {/* Explore Other Provinces */}
      {otherProvinces.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Explore More Cambodian Provinces
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Continue your journey across the Kingdom of Wonder
              </p>
            </div>
            <Link
              to="/provinces"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#003E83] dark:text-[#60a5fa] hover:underline"
            >
              All 25 Provinces
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherProvinces.map((prov) => (
              <Link
                key={prov.id}
                to={`/provinces/${prov.id}`}
                className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 hover:border-[#003E83] dark:hover:border-[#60a5fa] transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 block">
                    {prov.type || 'Province'}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-[#60a5fa] transition-colors mt-0.5">
                    {prov.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-1 mt-1">
                    {prov.places_count || 0} Registered Attractions
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#003E83] dark:text-[#60a5fa] mt-3 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={eventModalOpen}
        event={selectedEvent}
        onClose={() => {
          setEventModalOpen(false);
          setSelectedEvent(null);
        }}
      />

      {/* Tour Package Booking Modal */}
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
