import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  DollarSign, 
  Trash2, 
  Copy, 
  ChevronRight, 
  X, 
  Compass
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

export default function Trips() {
  const { showSuccess, showError, showConfirm } = useAlert();

  const [trips, setTrips] = useState([]);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'planning' | 'confirmed' | 'completed'

  // Trip Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('Siem Reap');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('350');
  const [travelers, setTravelers] = useState(2);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('planning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Trip Detail Modal
  const [activeTrip, setActiveTrip] = useState(null);

  // Add Itinerary Activity Modal
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [activityDayNumber, setActivityDayNumber] = useState(1);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityTimeSlot, setActivityTimeSlot] = useState('09:00 AM');
  const [activityDuration, setActivityDuration] = useState('120'); // minutes
  const [activityCost, setActivityCost] = useState('0');
  const [activityNotes, setActivityNotes] = useState('');
  const [activityPlaceId, setActivityPlaceId] = useState('');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const fetchTrips = useCallback(() => {
    setIsLoading(true);
    const params = selectedFilter !== 'all' ? { status: selectedFilter } : {};

    travelService.getTrips(params)
      .then((res) => {
        if (res?.success) {
          const list = res.data?.trips || res.data?.data || res.data || [];
          setTrips(Array.isArray(list) ? list : []);
        } else {
          setTrips([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load trips:', err);
        setTrips([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedFilter]);

  useEffect(() => {
    fetchTrips();

    // Fetch places for linking to trip itineraries
    travelService.getPlaces({ per_page: 50 }).then((res) => {
      if (res?.success) {
        const pList = res.data?.places || res.data?.data || res.data || [];
        setPlaces(Array.isArray(pList) ? pList : []);
      }
    }).catch(() => {});
  }, [fetchTrips]);

  const loadTripDetails = async (tripId) => {
    try {
      const res = await travelService.getTrip(tripId);
      if (res?.success) {
        const fullTrip = res.data?.trip || res.data;
        setActiveTrip(fullTrip);
      }
    } catch {
      showError('Failed to load trip activities.');
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please name your trip plan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        destination: destination.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        budget: parseFloat(budget) || 0,
        currency: 'USD',
        travelers: parseInt(travelers, 10) || 1,
        status: status || 'planning',
        notes: notes.trim() || undefined,
      };

      const res = await travelService.createTrip(payload);
      if (res?.success) {
        showSuccess('New trip plan created! Start organizing your itinerary.', 'Trip Created');
        setIsCreateModalOpen(false);
        setTitle('');
        setNotes('');
        fetchTrips();
        if (res.data?.id) {
          loadTripDetails(res.data.id);
        }
      } else {
        showError(res?.message || 'Failed to create trip.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to save trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (tripId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await travelService.duplicateTrip(tripId);
      if (res?.success) {
        showSuccess('Trip plan cloned successfully!');
        fetchTrips();
      }
    } catch {
      showError('Unable to duplicate trip.');
    }
  };

  const handleDeleteTrip = async (tripId, e) => {
    if (e) e.stopPropagation();
    const confirmed = await showConfirm({
      title: 'Delete Trip Plan',
      message: 'Delete this trip itinerary? All scheduled stops will be removed.',
      confirmText: 'Delete Trip',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await travelService.deleteTrip(tripId);
      if (res?.success) {
        showSuccess('Trip removed.');
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
        if (activeTrip?.id === tripId) {
          setActiveTrip(null);
        }
      }
    } catch {
      showError('Unable to delete trip.');
    }
  };

  const handleOpenAddActivity = (dayNum = 1) => {
    setActivityDayNumber(dayNum);
    setActivityTitle('');
    setActivityTimeSlot('09:00 AM');
    setActivityDuration('120');
    setActivityCost('0');
    setActivityNotes('');
    setActivityPlaceId('');
    setIsAddActivityModalOpen(true);
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activityTitle.trim() || !activeTrip) {
      showError('Please enter an activity description.');
      return;
    }

    setIsSubmittingActivity(true);
    try {
      const payload = {
        day_number: parseInt(activityDayNumber, 10) || 1,
        activity: activityTitle.trim(),
        time_slot: activityTimeSlot.trim() || undefined,
        duration_minutes: parseInt(activityDuration, 10) || undefined,
        estimated_cost: parseFloat(activityCost) || 0,
        notes: activityNotes.trim() || undefined,
        place_id: activityPlaceId ? parseInt(activityPlaceId, 10) : undefined,
      };

      const res = await travelService.addTripItinerary(activeTrip.id, payload);
      if (res?.success) {
        showSuccess('Activity added to day itinerary!');
        setIsAddActivityModalOpen(false);
        loadTripDetails(activeTrip.id);
        fetchTrips();
      } else {
        showError(res?.message || 'Failed to add activity.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to add activity to itinerary.');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleDeleteActivity = async (itineraryId) => {
    if (!activeTrip) return;
    try {
      const res = await travelService.deleteTripItinerary(activeTrip.id, itineraryId);
      if (res?.success) {
        showSuccess('Activity removed from itinerary.');
        loadTripDetails(activeTrip.id);
        fetchTrips();
      }
    } catch {
      showError('Failed to remove activity.');
    }
  };

  // Group active trip's itineraries by day number
  const groupedItineraries = (activeTrip?.itineraries || []).reduce((acc, item) => {
    const day = item.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const maxDay = Math.max(
    activeTrip?.duration_days || 1,
    ...Object.keys(groupedItineraries).map(Number),
    1
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Personal Itinerary Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Planned Trips & Itineraries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Organize multi-day Cambodian expeditions, schedule daily temple stops, and track travel budgets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3 text-xs font-bold">
        {['all', 'planning', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl capitalize transition cursor-pointer ${
              selectedFilter === tab
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving your travel itineraries from database..." />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No travel itineraries found"
          description="You haven't created any trip plans in this category yet. Click below to craft your first Cambodian journey."
          action={
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#002D62] text-white text-xs font-bold shadow-sm"
            >
              Start Planning a Trip
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const hasDates = trip.start_date || trip.end_date;
            return (
              <div
                key={trip.id}
                onClick={() => loadTripDetails(trip.id)}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      trip.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : trip.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {trip.status || 'Planning'}
                    </span>

                    <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200">
                      {trip.duration_days ? `${trip.duration_days} Days` : 'Multi-Day'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span className="truncate">{trip.destination || 'Cambodia'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {trip.notes || 'Custom trip plan created in AngkorVerses planner.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                      <span className="truncate">
                        {hasDates ? `${trip.start_date || 'Start'} → ${trip.end_date || 'End'}` : 'Flexible Dates'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-emerald-600 shrink-0" />
                      <span>Budget: ${Number(trip.budget || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 flex items-center gap-1">
                    <span>{trip.itineraries_count || 0} Scheduled Stops</span>
                    <ChevronRight size={13} />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Clone Trip"
                      onClick={(e) => handleDuplicate(trip.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      title="Delete Trip"
                      onClick={(e) => handleDeleteTrip(trip.id, e)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Trip Detail Modal (Day-by-Day Timeline) */}
      {activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                    Trip Itinerary Schedule
                  </span>
                  <Badge variant={activeTrip.status === 'confirmed' ? 'success' : 'neutral'}>
                    {activeTrip.status}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {activeTrip.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-rose-500" />
                    {activeTrip.destination || 'Cambodia'}
                  </span>
                  <span>•</span>
                  <span>Budget: ${Number(activeTrip.budget || 0).toFixed(0)} USD</span>
                  <span>•</span>
                  <span>{activeTrip.travelers || 1} Travelers</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTrip(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Day Timeline */}
            <div className="space-y-6">
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((dayNum) => {
                const dayStops = groupedItineraries[dayNum] || [];
                return (
                  <div
                    key={dayNum}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#002D62] text-white flex items-center justify-center font-bold text-xs">
                          {dayNum}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          Day {dayNum} Schedule
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenAddActivity(dayNum)}
                        className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 text-[#002D62] dark:text-blue-400 text-xs font-bold border border-slate-200 dark:border-zinc-700 shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Add Activity</span>
                      </button>
                    </div>

                    {dayStops.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2 pl-9">
                        No activities scheduled for this day yet. Click "Add Activity" above.
                      </p>
                    ) : (
                      <div className="space-y-2.5 pl-2">
                        {dayStops.map((stop) => (
                          <div
                            key={stop.id}
                            className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold text-[#002D62] dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40">
                                  {stop.time_slot || 'Anytime'}
                                </span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {stop.activity}
                                </span>
                              </div>

                              {stop.place && (
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                  <MapPin size={11} className="text-rose-400" />
                                  <span>{stop.place.name}</span>
                                </div>
                              )}

                              {stop.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                  {stop.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {stop.estimated_cost > 0 && (
                                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                                  ${Number(stop.estimated_cost).toFixed(0)}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteActivity(stop.id)}
                                className="text-slate-400 hover:text-rose-500 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTrip(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-semibold text-xs"
              >
                Close Planner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Trip Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  New Journey Plan
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Create Trip Itinerary
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Trip Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3-Day Angkor Sunrise & Floating Village Expedition"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Destination Province
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Siem Reap, Phnom Penh, Kampot..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Total Estimated Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Trip Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  >
                    <option value="planning">Planning (Draft)</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Trip Notes & Packing Reminders
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Temple passes, sunscreen, camera lenses, local guide contacts..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to DB...' : 'Create Trip Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Itinerary Activity Modal */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  Day {activityDayNumber} Stop
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add Activity to Day {activityDayNumber}
                </h3>
              </div>
              <button onClick={() => setIsAddActivityModalOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddActivitySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Activity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Sunrise by Northern Reflecting Pond"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              {places.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Link to Destination (Optional)
                  </label>
                  <select
                    value={activityPlaceId}
                    onChange={(e) => setActivityPlaceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  >
                    <option value="">No specific place linked</option>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.province?.name || 'Cambodia'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={activityTimeSlot}
                    onChange={(e) => setActivityTimeSlot(e.target.value)}
                    placeholder="05:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Estimated Cost ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={activityCost}
                  onChange={(e) => setActivityCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingActivity}
                  className="px-5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingActivity ? 'Saving...' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
