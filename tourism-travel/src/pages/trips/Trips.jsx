import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, DollarSign, Plus, Copy, Trash2,
  Compass, ArrowRight, CheckCircle2, Clock, AlertCircle,
  Sparkles, Wallet, Plane, ChevronRight, X
} from 'lucide-react';
import tripService from '../../services/tripService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

const POPULAR_DESTINATIONS = [
  'Siem Reap',
  'Phnom Penh',
  'Kampot & Kep',
  'Koh Rong',
  'Battambang',
  'Mondulkiri'
];

const BUDGET_PRESETS = [100, 250, 500, 1000];

export default function Trips() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Create Trip Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination: 'Siem Reap',
    start_date: '',
    end_date: '',
    budget: 150,
    travelers: 2,
    status: 'planning',
    notes: '',
    is_public: false,
  });

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await tripService.getTrips(params);
      setTrips(res.data || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
      setError(err.response?.data?.message || 'Unable to load your trips.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Trip Statistics
  const stats = useMemo(() => {
    const total = trips.length;
    const planning = trips.filter(t => t.status === 'planning').length;
    const confirmed = trips.filter(t => t.status === 'confirmed').length;
    const completed = trips.filter(t => t.status === 'completed').length;
    const cancelled = trips.filter(t => t.status === 'cancelled').length;
    const budgetSum = trips.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);
    return { total, planning, confirmed, completed, cancelled, budgetSum };
  }, [trips]);

  const totalPages = Math.ceil(trips.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, trips.length);
  const paginatedTrips = trips.slice(startIndex, endIndex);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showAlert('error', 'Trip Title Required', 'Please enter a title for your trip.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await tripService.createTrip(formData);
      showAlert('success', 'Trip Created!', 'Your new travel plan has been created.');
      setShowCreateModal(false);
      setFormData({
        title: '',
        destination: 'Siem Reap',
        start_date: '',
        end_date: '',
        budget: 150,
        travelers: 2,
        status: 'planning',
        notes: '',
        is_public: false,
      });
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      console.error('Create trip error:', err);
      showAlert('error', 'Creation Failed', err.response?.data?.message || 'Could not create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (tripId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await tripService.duplicateTrip(tripId);
      showAlert('success', 'Trip Duplicated', 'A copy of the trip was created.');
      fetchTrips();
    } catch {
      showAlert('error', 'Failed', 'Could not duplicate trip.');
    }
  };

  const handleDelete = async (tripId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripService.deleteTrip(tripId);
      showAlert('success', 'Deleted', 'Trip was removed successfully.');
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch {
      showAlert('error', 'Failed', 'Could not delete trip.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <CheckCircle2 size={12} />
            <span>Confirmed</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-2xs">
            <CheckCircle2 size={12} />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shadow-2xs">
            <X size={12} />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-2xs">
            <Clock size={12} />
            <span>Planning</span>
          </span>
        );
    }
  };

  const filterTabs = [
    { key: 'all', label: 'All Trips', count: stats.total },
    { key: 'planning', label: 'Planning', count: stats.planning },
    { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
    { key: 'completed', label: 'Completed', count: stats.completed },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <Breadcrumb items={[{ label: 'My Trips' }]} />

      {/* Modern Hero & Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>AngkorVerses Itinerary Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Travel Trips & Itineraries
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
              Design, organize, and budget your personalized journeys across the Kingdom of Cambodia.
            </p>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 text-gray-700 dark:text-zinc-300 shadow-2xs font-medium">
                <Plane className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" />
                <span><strong className="text-gray-900 dark:text-white font-bold">{stats.total}</strong> Itineraries</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 text-gray-700 dark:text-zinc-300 shadow-2xs font-medium">
                <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Est. Budget: <strong className="text-gray-900 dark:text-white font-bold">${stats.budgetSum.toLocaleString()} USD</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 text-gray-700 dark:text-zinc-300 shadow-2xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span><strong className="text-gray-900 dark:text-white font-bold">{stats.planning}</strong> in Planning</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#003E83] to-blue-600 hover:from-[#002e62] hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-900/30 transition-all duration-200 active:scale-98 cursor-pointer"
            >
              <Plus size={18} className="stroke-[2.5]" />
              <span>Create New Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter Capsule Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-zinc-800 overflow-x-auto no-scrollbar w-fit max-w-full">
        {filterTabs.map((tab) => {
          const isActive = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setFilterStatus(tab.key);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-[#003E83] dark:text-white shadow-xs font-bold'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-[#003E83]/10 dark:bg-blue-400/20 text-[#003E83] dark:text-blue-300'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-72 rounded-3xl bg-gray-100 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-10 rounded-3xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-red-900 dark:text-red-200">Unable to Load Trips</h3>
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={fetchTrips}
            className="mt-2 px-5 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : trips.length === 0 ? (
        <div className="p-14 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-950/60 dark:to-zinc-800 text-[#003E83] dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200/50 dark:border-blue-900/40 shadow-xs">
            <Compass size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {filterStatus === 'all' ? 'No Travel Plans Yet' : `No ${filterStatus} trips`}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Start by creating your first personalized itinerary. Add destinations, customize activities, and manage your budget effortlessly.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold transition-all shadow-md shadow-blue-900/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Your First Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="group modern-card bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Card Header & Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-zinc-800 text-xs font-semibold text-[#003E83] dark:text-blue-300 border border-blue-100 dark:border-zinc-700">
                      <MapPin size={13} className="text-[#003E83] dark:text-blue-400" />
                      <span className="truncate max-w-[150px]">{trip.destination || 'Cambodia'}</span>
                    </span>
                    {getStatusBadge(trip.status)}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>

                  {trip.notes ? (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {trip.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 italic mt-1.5">
                      No custom notes added for this travel plan.
                    </p>
                  )}
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50">
                    <Calendar size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-semibold text-gray-700 dark:text-zinc-300 truncate">
                      {trip.start_date ? `${trip.duration_days || 1} Days` : 'Flexible'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50">
                    <Users size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">
                      {trip.travelers} Guest{trip.travelers > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50">
                    <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold text-gray-700 dark:text-zinc-300 truncate">
                      ${trip.budget || 0} {trip.currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50">
                    <Compass size={14} className="text-amber-500 shrink-0" />
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">
                      {trip.itineraries_count || 0} Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-6 py-3.5 bg-gray-50/90 dark:bg-zinc-800/60 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[#003E83] dark:text-blue-400 font-bold group-hover:underline inline-flex items-center gap-1.5">
                  <span>View Itinerary</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleDuplicate(trip.id, e)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 transition-colors shadow-2xs"
                    title="Duplicate Trip"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(trip.id, e)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-2xs"
                    title="Delete Trip"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={trips.length}
        label="travel plans"
      />

      {/* Modern Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-bold text-[#003E83] dark:text-blue-400 uppercase tracking-wider">
                  New Journey
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5">
                  Plan Your Next Cambodian Trip
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Configure destination, dates, and budget to begin adding attractions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 4 Days Siem Reap Ancient Temples & Sunset"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] dark:focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Destination with Quick Selector Pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Primary Destination
                  </label>
                  <span className="text-[11px] text-gray-400">Quick suggestions:</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g., Siem Reap, Kampot, Koh Rong"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] dark:focus:ring-blue-500 transition-all mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setFormData({ ...formData, destination: dest })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        formData.destination === dest
                          ? 'bg-[#003E83] text-white border-[#003E83]'
                          : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:border-gray-300'
                      }`}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates & Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    min={formData.start_date || undefined}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.travelers}
                    onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]"
                  />
                </div>
              </div>

              {/* Budget with Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Estimated Budget ($ USD)
                  </label>
                  <div className="flex items-center gap-1">
                    {BUDGET_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormData({ ...formData, budget: amt })}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                          Number(formData.budget) === amt
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]"
                  />
                </div>
              </div>

              {/* Trip Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Trip Notes / Travel Wishlist
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g., Book tuk-tuk sunrise tour, try Amok Fish in Pub Street, visit Angkor National Museum..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold transition-all shadow-md shadow-blue-900/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? 'Creating...' : 'Create Itinerary'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
