import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Plus, Trash2,
  ArrowLeft, Compass, Sparkles, AlertCircle
} from 'lucide-react';
import tripService from '../../services/tripService';
import placeService from '../../services/placeService';
import aiService from '../../services/aiService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function TripDetails() {
  const { id } = useParams();
  const { showAlert } = useAlert();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available Places for quick-picker
  const [places, setPlaces] = useState([]);

  // Add Itinerary Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    day_number: 1,
    time_slot: '09:00 AM',
    activity: '',
    place_id: '',
    estimated_cost: 0,
    duration_minutes: 60,
    notes: '',
  });

  // AI Itinerary Auto-Generator State
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchTripDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tripService.getTripById(id);
      setTrip(res.data);
    } catch (err) {
      console.error('Trip details fetch error:', err);
      setError(err.response?.data?.message || 'Could not load trip details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPlaces = useCallback(async () => {
    try {
      const res = await placeService.getPlaces({ per_page: 50 });
      setPlaces(res.data || []);
    } catch (err) {
      console.error('Places fetch error:', err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTripDetails();
    fetchPlaces();
  }, [id, fetchTripDetails, fetchPlaces]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.activity.trim()) {
      showAlert('error', 'Activity Required', 'Please enter what you plan to do.');
      return;
    }
    setAddingItem(true);
    try {
      await tripService.addItinerary(id, newItem);
      showAlert('success', 'Activity Added', 'New item added to itinerary.');
      setShowAddModal(false);
      setNewItem({
        day_number: 1,
        time_slot: '09:00 AM',
        activity: '',
        place_id: '',
        estimated_cost: 0,
        duration_minutes: 60,
        notes: '',
      });
      fetchTripDetails();
    } catch (err) {
      showAlert('error', 'Failed to Add', err.response?.data?.message || 'Could not add itinerary item.');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itineraryId) => {
    if (!window.confirm('Remove this activity from the itinerary?')) return;
    try {
      await tripService.deleteItinerary(id, itineraryId);
      showAlert('success', 'Removed', 'Activity removed.');
      fetchTripDetails();
    } catch {
      showAlert('error', 'Error', 'Could not delete item.');
    }
  };

  const handleGenerateAiItinerary = async () => {
    if (!trip) return;
    try {
      setGeneratingAi(true);
      showAlert('info', 'AI Assistant', 'AngkorVerse AI is generating suggestions for your itinerary...');
      const res = await aiService.generateItinerary({
        destination: trip.destination || 'Siem Reap',
        duration_days: trip.duration_days || 3,
        budget: 'moderate',
      });

      const aiData = res.data;
      if (aiData?.days && Array.isArray(aiData.days)) {
        for (const day of aiData.days) {
          if (day.activities && Array.isArray(day.activities)) {
            for (const act of day.activities) {
              await tripService.addItinerary(id, {
                day_number: day.day || 1,
                time_slot: act.time || '10:00 AM',
                activity: act.activity || 'Sightseeing',
                estimated_cost: act.cost || 0,
                notes: 'Suggested by AngkorVerse AI',
              });
            }
          }
        }
        showAlert('success', 'Itinerary Populated!', 'AI suggestions have been added to your schedule.');
        fetchTripDetails();
      }
    } catch (err) {
      console.error('AI itinerary error:', err);
      showAlert('error', 'AI Failed', 'Could not generate itinerary automatically.');
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-48 rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-lg bg-gray-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trip Not Found</h2>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1 mb-6">{error}</p>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003E83] text-white text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Back to Trips</span>
        </Link>
      </div>
    );
  }

  // Group itineraries by day_number
  const itineraries = trip.itineraries || [];
  const daysMap = {};
  const maxDays = Math.max(trip.duration_days || 1, 1);

  for (let i = 1; i <= maxDays; i++) {
    daysMap[i] = [];
  }

  itineraries.forEach((item) => {
    const day = item.day_number || 1;
    if (!daysMap[day]) daysMap[day] = [];
    daysMap[day].push(item);
  });

  const totalCalculatedCost = itineraries.reduce((sum, it) => sum + (parseFloat(it.estimated_cost) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <Breadcrumb
        items={[
          { label: 'My Trips', to: '/trips' },
          { label: trip.title || 'Trip Details' }
        ]}
      />
      {/* Back button */}
      <Link
        to="/trips"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-[#003E83] dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to All Trips</span>
      </Link>

      {/* Hero Trip Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.destination || 'Cambodia Adventure'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {trip.title}
            </h1>
            {trip.notes && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {trip.notes}
              </p>
            )}
          </div>

          {/* Quick stats pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/60 dark:border-zinc-700/60 shadow-xs shrink-0">
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider">Duration</span>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">{trip.duration_days} Days</p>
            </div>
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider">Travelers</span>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">{trip.travelers} Guests</p>
            </div>
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider">Planned</span>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">${totalCalculatedCost.toFixed(2)}</p>
            </div>
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider">Budget</span>
              <p className="text-sm font-extrabold text-[#003E83] dark:text-blue-300 mt-0.5">${trip.budget || 0}</p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-gray-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400">
            <Calendar className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
            <span>
              {trip.start_date ? `${trip.start_date} → ${trip.end_date}` : 'Dates not scheduled yet'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateAiItinerary}
              disabled={generatingAi}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generatingAi ? 'Generating AI...' : 'Auto-Fill with AI'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#003E83] to-blue-700 hover:from-[#002f63] hover:to-blue-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Activity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Day by Day Itinerary Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Compass size={18} className="text-[#003E83] dark:text-[#60a5fa]" />
            <span>Day-by-Day Schedule</span>
          </h2>
          <span className="text-xs text-gray-500 dark:text-zinc-400">
            {itineraries.length} total activities planned
          </span>
        </div>

        {Object.entries(daysMap).map(([dayNum, dayItems]) => (
          <div
            key={dayNum}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-blue-200 dark:hover:border-zinc-700 transition-colors"
          >
            {/* Day Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50/40 via-slate-50/50 to-white dark:from-zinc-800/60 dark:to-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-[#003E83] dark:bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  D{dayNum}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    Day {dayNum} Itinerary
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {dayItems.length} activities scheduled
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setNewItem(prev => ({ ...prev, day_number: parseInt(dayNum) }));
                  setShowAddModal(true);
                }}
                className="text-xs text-[#003E83] dark:text-blue-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add to Day {dayNum}
              </button>
            </div>

            {/* Activities in this Day */}
            {dayItems.length === 0 ? (
              <div className="p-8 text-center text-xs sm:text-sm text-gray-400 dark:text-zinc-500">
                No activities added for Day {dayNum} yet. Click "Add Activity" to plan your stops.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/20 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-300 text-xs font-bold shrink-0 mt-0.5 border border-blue-100/80 dark:border-blue-900/40">
                        {item.time_slot || 'Anytime'}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {item.activity}
                        </h4>

                        {item.place && (
                          <Link
                            to={`/places/${item.place.id}`}
                            className="inline-flex items-center gap-1 text-xs text-[#003E83] dark:text-blue-400 hover:underline font-semibold"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{item.place.name} ({item.place.province?.name || item.place.province || 'Cambodia'})</span>
                          </Link>
                        )}

                        {item.notes && (
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-zinc-800">
                      {item.estimated_cost > 0 && (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                          ${parseFloat(item.estimated_cost).toFixed(2)}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
              Add Activity to Itinerary
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-5">
              Specify what you'll do, time slot, and destination stop.
            </p>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Day Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxDays}
                    required
                    value={newItem.day_number}
                    onChange={(e) => setNewItem({ ...newItem, day_number: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Time / Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 05:30 AM"
                    value={newItem.time_slot}
                    onChange={(e) => setNewItem({ ...newItem, time_slot: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Activity Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise photo shoot at Angkor Wat reflecting pool"
                  value={newItem.activity}
                  onChange={(e) => setNewItem({ ...newItem, activity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Link to Destination (Optional)
                </label>
                <select
                  value={newItem.place_id}
                  onChange={(e) => setNewItem({ ...newItem, place_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]/20"
                >
                  <option value="">-- None / Custom Activity --</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.province?.name || 'Cambodia'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Estimated Cost ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newItem.estimated_cost}
                  onChange={(e) => setNewItem({ ...newItem, estimated_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring water and wide lens"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingItem}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#003E83] to-blue-700 hover:from-[#002f63] hover:to-blue-800 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {addingItem ? 'Adding...' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
