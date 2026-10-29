import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  X, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const ITEMS_PER_PAGE = 9;

export default function TourPackages() {
  const { showSuccess, showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState(['All']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: ITEMS_PER_PAGE });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const search = searchParams.get('search') || '';
  const selectedDestination = searchParams.get('destination') || 'All';
  const selectedDuration = searchParams.get('duration') || 'All';

  // Booking Modal
  const [activeTourForBooking, setActiveTourForBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Tour Details Modal
  const [activeTourDetails, setActiveTourDetails] = useState(null);

  const loadTours = useCallback(() => {
    let isMounted = true;
    setIsLoading(true);
    travelService.getTours({
      page: currentPage,
      per_page: ITEMS_PER_PAGE,
      search: search || undefined,
      destination: selectedDestination !== 'All' ? selectedDestination : undefined,
      duration: selectedDuration !== 'All' ? selectedDuration : undefined,
    })
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          const list = res.data?.tours || res.data?.data || res.data || [];
          setTours(Array.isArray(list) ? list : []);
          if (res.data?.pagination) setPagination(res.data.pagination);
          if (Array.isArray(res.data?.destinations)) {
            setDestinations(res.data.destinations);
          }
        } else {
          setTours([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load tours from API:', err);
        setTours([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [currentPage, search, selectedDestination, selectedDuration]);

  useEffect(() => {
    return loadTours();
  }, [loadTours]);

  const handleFilterChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setCurrentPage(1);
    setSearchParams(next);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      showError('Please select your preferred tour departure date.');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const guestNum = Number(guestsCount) || 1;
      const unitPrice = Number(activeTourForBooking.price) || 0;
      const calculatedTotal = unitPrice * guestNum;

      const payload = {
        business_id: activeTourForBooking.business_id || undefined,
        tour_id: activeTourForBooking.id,
        booking_date: bookingDate,
        number_of_guests: guestNum,
        guests_count: guestNum,
        special_requests: `[Tour: ${activeTourForBooking.title}] ${bookingNotes.trim()}`.trim() || undefined,
        total_price: calculatedTotal,
        total_amount: calculatedTotal,
      };

      const res = await travelService.createBooking(payload);
      if (res?.success) {
        showSuccess(`Your booking request for "${activeTourForBooking.title}" has been submitted.`, 'Request Submitted');
        setActiveTourForBooking(null);
        setBookingDate('');
        setBookingNotes('');
      } else {
        showError(res?.message || 'Failed to place booking.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to submit booking to database.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const totalPages = pagination.last_page;
  const paginatedTours = tours;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Tour Packages Database
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Guided Tour Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Explore curated tour packages recorded in the central database.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search tours..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            />
          </div>

          <div>
            <select
              value={selectedDestination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">All Tour Destinations</option>
              {destinations.filter(d => d !== 'All').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDuration}
              onChange={(e) => handleFilterChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">Any Duration</option>
              <option value="1">1 Day</option>
              <option value="2-3">2-3 Days</option>
              <option value="4+">4+ Days</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
          <div>
            Total Tours in Database: <strong className="text-slate-800 dark:text-zinc-200">{tours.length}</strong>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck size={14} />
            <span>Ministry Verified Operators</span>
          </div>
        </div>
      </div>

      {/* Tours Grid */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving tour packages from database..." />
      ) : tours.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No tour packages found in database"
          description="There are currently no active tour records available matching this filter."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedTours.map((t) => (
              <div
                key={t.id}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Sparkles size={32} />
                        <span className="text-[11px] mt-1">Tour Package</span>
                      </div>
                    )}

                    {t.badge && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/95 text-white text-[10px] font-bold tracking-wide shadow-sm">
                          {t.badge}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white font-black text-sm">
                      ${t.price} <span className="text-[10px] font-normal text-white/80">/ person</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3.5">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#002D62] dark:text-blue-400" />
                        <span>{t.duration}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-rose-500" />
                        <span>{t.destination || t.province}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {t.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{t.rating || 0}</span>
                      </div>
                      <span className="text-slate-500 dark:text-zinc-400">
                        ({t.reviewsCount || 0} reviews)
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {t.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTourDetails(t)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition cursor-pointer"
                  >
                    Details
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTourForBooking(t)}
                    className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar size={13} />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            lastPage={totalPages}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Book Tour Modal */}
      {activeTourForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Book Tour Package
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {activeTourForBooking.title}
                </h3>
              </div>
              <button onClick={() => setActiveTourForBooking(null)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Departure Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Travelers Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Special Requests / Pick-up Details
                </label>
                <textarea
                  rows={3}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Notes for the tour operator..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTourForBooking(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 py-2.5 rounded-xl bg-[#002D62] text-white font-bold disabled:opacity-50"
                >
                  {isSubmittingBooking ? 'Saving to DB...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tour Details Modal */}
      {activeTourDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeTourDetails.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{activeTourDetails.duration}</span>
                  <span>•</span>
                  <span>{activeTourDetails.destination || activeTourDetails.province}</span>
                </div>
              </div>
              <button onClick={() => setActiveTourDetails(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {activeTourDetails.image && (
              <img
                src={activeTourDetails.image}
                alt={activeTourDetails.title}
                className="w-full h-56 object-cover rounded-2xl"
              />
            )}

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">About This Tour</h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {activeTourDetails.description || 'No description available in database.'}
              </p>
            </div>

            {activeTourDetails.highlights && Array.isArray(activeTourDetails.highlights) && activeTourDetails.highlights.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Highlights</h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                  {activeTourDetails.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-base font-black text-slate-900 dark:text-white">
                ${activeTourDetails.price} / person
              </div>
              <button
                type="button"
                onClick={() => setActiveTourDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-semibold text-xs"
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
