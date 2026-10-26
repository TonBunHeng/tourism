import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Compass, X } from 'lucide-react';
import tourService from '../../services/tourService';
import { TOURS_DATA } from '../../data/toursData';
import TourPackageCard from '../../components/common/TourPackageCard';
import BookingModal from '../../components/common/BookingModal';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function Tours() {
  const [toursList, setToursList] = useState(TOURS_DATA);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [apiDestinations, setApiDestinations] = useState(['All']);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTourForBooking, setSelectedTourForBooking] = useState(null);

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDestination !== 'All') params.destination = selectedDestination;
      if (durationFilter !== 'All') {
        params.duration = durationFilter === '1day' ? '1' : durationFilter === 'short' ? '2-3' : '4+';
      }
      if (sortBy) params.sort = sortBy;

      const res = await tourService.getTours(params);
      const data = res?.data || res;
      const list = data?.tours || (Array.isArray(data) ? data : []);

      if (Array.isArray(list) && list.length > 0) {
        setToursList(list);
      } else {
        setToursList(TOURS_DATA);
      }
      if (Array.isArray(data?.destinations) && data.destinations.length > 0) {
        setApiDestinations(data.destinations);
      }
    } catch {
      setToursList(TOURS_DATA);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDestination, durationFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTours();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTours]);

  // Derive dynamic list of destinations from current tours and API
  const destinations = useMemo(() => {
    const set = new Set([...apiDestinations, ...toursList.map(t => t.province || t.destination)].filter(Boolean));
    return ['All', ...Array.from(set).filter(d => d !== 'All')];
  }, [toursList, apiDestinations]);

  const filteredTours = useMemo(() => {
    return toursList.filter((tour) => {
      const matchSearch =
        (tour.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (tour.destination || '').toLowerCase().includes(search.toLowerCase()) ||
        (tour.description || '').toLowerCase().includes(search.toLowerCase());

      const matchDest =
        selectedDestination === 'All' ||
        (tour.province || '').toLowerCase().includes(selectedDestination.toLowerCase()) ||
        (tour.destination || '').toLowerCase().includes(selectedDestination.toLowerCase());

      const matchDuration =
        durationFilter === 'All' ||
        (durationFilter === '1day' && tour.durationDays === 1) ||
        (durationFilter === 'short' && tour.durationDays >= 2 && tour.durationDays <= 3) ||
        (durationFilter === 'long' && tour.durationDays > 3);

      return matchSearch && matchDest && matchDuration;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.reviewsCount || 0) - (a.reviewsCount || 0);
    });
  }, [toursList, search, selectedDestination, durationFilter, sortBy]);

  const handleOpenBooking = (tour) => {
    setSelectedTourForBooking(tour);
    setBookingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Recommended Tours & Packages' }]} />

      {/* Hero Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Cambodian Curated Expeditions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recommended Tours & Packages
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              Discover expertly planned multi-day adventures, Angkor sunrise temple treks, tropical island getaways, and eco-tours live from our national database.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="px-4 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-[#003E83] dark:text-blue-400 shadow-2xs">
              {filteredTours.length} Experiences Available
            </span>
          </div>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tours or activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none transition-all"
            />
          </div>

          {/* Destination Filter */}
          <div>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none cursor-pointer"
            >
              <option value="All">All Regions / Provinces</option>
              {destinations.filter(d => d !== 'All').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none cursor-pointer"
            >
              <option value="All">All Durations</option>
              <option value="1day">Day Trips (1 Day)</option>
              <option value="short">Short Escapes (2 - 3 Days)</option>
              <option value="long">Extended Expeditions (4+ Days)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#003E83]/20 focus:outline-none cursor-pointer"
            >
              <option value="popular">Most Popular & Reviewed</option>
              <option value="rating">Highest Rated (5 Stars)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(search || selectedDestination !== 'All' || durationFilter !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-gray-400">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-300">
                &ldquo;{search}&rdquo;
                <X size={12} className="cursor-pointer" onClick={() => setSearch('')} />
              </span>
            )}
            {selectedDestination !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-300">
                {selectedDestination}
                <X size={12} className="cursor-pointer" onClick={() => setSelectedDestination('All')} />
              </span>
            )}
            {durationFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-300">
                Duration: {durationFilter}
                <X size={12} className="cursor-pointer" onClick={() => setDurationFilter('All')} />
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedDestination('All');
                setDurationFilter('All');
              }}
              className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold ml-2 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Tours Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-gray-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <TourPackageCard key={tour.id} tour={tour} onBook={handleOpenBooking} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-zinc-800 flex items-center justify-center mx-auto text-[#003E83] dark:text-blue-400">
            <Compass size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No tours match your criteria</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search terms, destination, or duration filter to discover more packages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedDestination('All');
              setDurationFilter('All');
            }}
            className="px-5 py-2.5 bg-[#003E83] text-white font-bold text-xs rounded-xl hover:bg-[#002e62] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        targetItem={selectedTourForBooking}
        type="tour"
      />
    </div>
  );
}
