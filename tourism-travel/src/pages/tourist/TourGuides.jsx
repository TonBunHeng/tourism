import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  UserCheck, 
  Search, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  X,
  Phone
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function TourGuides() {
  const { showSuccess, showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  const [guides, setGuides] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState(['All']);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const search = searchParams.get('search') || '';
  const selectedProvince = searchParams.get('province') || 'All';
  const selectedLanguage = searchParams.get('lang') || 'All';

  // Hire Modal
  const [selectedGuideForHire, setSelectedGuideForHire] = useState(null);
  const [hireDate, setHireDate] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Guide Details Modal
  const [activeGuideDetails, setActiveGuideDetails] = useState(null);

  const loadGuides = () => {
    setIsLoading(true);
    travelService.getGuides({
      search: search || undefined,
      province: selectedProvince !== 'All' ? selectedProvince : undefined,
      language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
    })
      .then((res) => {
        if (res?.success) {
          const raw = res.data?.guides || res.data?.data || res.data || [];
          setGuides(Array.isArray(raw) ? raw : []);
          if (Array.isArray(res.data?.available_languages)) {
            setAvailableLanguages(['All', ...res.data.available_languages]);
          }
        } else {
          setGuides([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load guides from API:', err);
        setGuides([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadGuides();
  }, [search, selectedProvince, selectedLanguage]);

  const handleFilterChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!hireDate) {
      showError('Please choose your preferred guiding date.');
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const guestNum = Number(groupSize) || 1;
      const rate = Number(selectedGuideForHire.daily_rate) || 0;

      // Create reservation or inquiry
      await travelService.createBooking({
        business_id: selectedGuideForHire.business_id || 1,
        guide_id: selectedGuideForHire.id,
        booking_date: hireDate,
        number_of_guests: guestNum,
        guests_count: guestNum,
        special_requests: `[Private Tour Guide: ${selectedGuideForHire.name}] ${inquiryNotes.trim()}`.trim() || undefined,
        total_price: rate,
        total_amount: rate,
      });

      showSuccess(`Your guiding request for ${selectedGuideForHire.name} has been placed in the database.`, 'Guide Request Sent');
      setSelectedGuideForHire(null);
      setHireDate('');
      setInquiryNotes('');
    } catch (err) {
      showError(err?.message || 'Unable to submit guide inquiry.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-[#002D62] text-white p-8 sm:p-12 shadow-xl">
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 border border-white/20">
            <UserCheck size={13} className="text-amber-300" />
            <span>Tour Guides Database</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Accredited Tour Guides
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
            Search licensed tour guides registered with the Ministry of Tourism.
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
              placeholder="Search guide name, location..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            />
          </div>

          <div>
            <select
              value={selectedProvince}
              onChange={(e) => handleFilterChange('province', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">All Locations</option>
              <option value="Siem Reap">Siem Reap</option>
              <option value="Phnom Penh">Phnom Penh</option>
              <option value="Battambang">Battambang</option>
              <option value="Preah Sihanouk">Preah Sihanouk</option>
              <option value="Kampot">Kampot</option>
              <option value="Koh Kong">Koh Kong</option>
            </select>
          </div>

          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => handleFilterChange('lang', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              {availableLanguages.map((l) => (
                <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
          <div>
            Active Guides in Database: <strong className="text-slate-800 dark:text-zinc-200">{guides.length}</strong>
          </div>
        </div>
      </div>

      {/* Guides Grid */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving guides from database..." />
      ) : guides.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No guide records found in database"
          description="There are currently no registered guide profiles matching your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((g) => (
            <div
              key={g.id}
              className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    {g.avatar ? (
                      <img
                        src={g.avatar}
                        alt={g.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#002D62] text-white flex items-center justify-center font-bold text-lg">
                        {g.name?.charAt(0) || 'G'}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white">
                      <CheckCircle2 size={12} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                        {g.name}
                      </h3>
                      {g.daily_rate && (
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          ${g.daily_rate}/day
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#002D62] dark:text-blue-400 font-semibold line-clamp-1 mt-0.5">
                      {g.title || 'Tour Guide'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{g.rating || 0}</span>
                      </div>
                      <span>({g.review_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin size={12} className="text-rose-500 shrink-0" />
                    <span>{g.location || g.province || 'Cambodia'}</span>
                  </div>
                  {g.license_no && (
                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-300">
                      {g.license_no}
                    </span>
                  )}
                </div>

                {g.languages && Array.isArray(g.languages) && g.languages.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {g.languages.map((l, i) => (
                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#002D62] dark:text-blue-300">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {g.bio || 'No biography recorded in database.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveGuideDetails(g)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition cursor-pointer"
                >
                  View Profile
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGuideForHire(g)}
                  className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>Hire Guide</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hire Guide Modal */}
      {selectedGuideForHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Book Certified Guide</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedGuideForHire.name}
                </h3>
              </div>
              <button onClick={() => setSelectedGuideForHire(null)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Guiding Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Travelers Count</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Trip Notes / Itinerary Details
                </label>
                <textarea
                  rows={3}
                  value={inquiryNotes}
                  onChange={(e) => setInquiryNotes(e.target.value)}
                  placeholder="Tell the guide about your preferred destinations and languages..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedGuideForHire(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="px-5 py-2.5 rounded-xl bg-[#002D62] text-white font-bold disabled:opacity-50"
                >
                  {isSubmittingInquiry ? 'Saving to DB...' : 'Save Guide Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guide Details Modal */}
      {activeGuideDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeGuideDetails.name}
                </h2>
                <p className="text-xs text-[#002D62] dark:text-blue-400 font-semibold">
                  {activeGuideDetails.title || 'Tour Guide'}
                </p>
                <div className="text-xs text-slate-500 mt-1">
                  Location: {activeGuideDetails.location || activeGuideDetails.province || 'Cambodia'}
                </div>
              </div>
              <button onClick={() => setActiveGuideDetails(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Biography</h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {activeGuideDetails.bio || 'No biography recorded in database.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveGuideDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-semibold text-xs"
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
