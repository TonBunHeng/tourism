import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  Heart, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  Award, 
  Plus, 
  CalendarCheck, 
  ChevronRight, 
  Trash2, 
  Loader2, 
  Bot, 
  PlaneTakeoff, 
  Luggage, 
  Sun 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { useAlert } from '../../context/AlertContext';
import bookingService from '../../services/bookingService';
import favoriteService from '../../services/favoriteService';
import tripService from '../../services/tripService';
import achievementService from '../../services/achievementService';
import Breadcrumb from '../../components/common/Breadcrumb';
import TourPackageCard from '../../components/common/TourPackageCard';
import BookingModal from '../../components/common/BookingModal';
import { TOURS_DATA } from '../../data/toursData';

export default function TravelUserDashboard() {
  const { user } = useAuth();
  const { showToast, toggleChat } = useTravel();
  const { showConfirm, showSuccess, showError } = useAlert();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'wishlist' | 'trips'
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [trips, setTrips] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTourForBooking, setSelectedTourForBooking] = useState(null);

  // Fetch travel user personalized data
  const loadUserData = useCallback(async () => {
    try {
      const [bookRes, favRes, tripRes, achRes] = await Promise.allSettled([
        bookingService.getMyBookings({ limit: 10 }),
        favoriteService.getFavorites(),
        tripService.getTrips(),
        achievementService.getMyAchievements().catch(() => achievementService.getAchievements()),
      ]);

      if (bookRes.status === 'fulfilled') {
        const data = bookRes.value?.data || bookRes.value || [];
        setBookings(Array.isArray(data) ? data : (data?.data || []));
      }

      if (favRes.status === 'fulfilled') {
        const data = favRes.value?.data || favRes.value || [];
        setFavorites(Array.isArray(data) ? data : (data?.data || []));
      }

      if (tripRes.status === 'fulfilled') {
        const data = tripRes.value?.data || tripRes.value || [];
        setTrips(Array.isArray(data) ? data : (data?.data || []));
      }

      if (achRes.status === 'fulfilled') {
        const data = achRes.value?.data || achRes.value || [];
        setAchievements(Array.isArray(data) ? data : (data?.data || []));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Cancel booking handler
  const handleCancelBooking = (bookingId, bookingTitle) => {
    showConfirm(
      `Are you sure you want to cancel your booking for "${bookingTitle || 'this reservation'}"?`,
      async () => {
        try {
          await bookingService.cancelBooking(bookingId, 'Cancelled by traveler from space');
          showSuccess('Your reservation has been cancelled successfully.', 'Booking Cancelled');
          loadUserData();
        } catch (err) {
          showError(err.message || 'Failed to cancel booking', 'Error');
        }
      },
      {
        title: 'Cancel Booking',
        confirmText: 'Confirm Cancellation',
        type: 'danger',
      }
    );
  };

  // Remove favorite handler
  const handleRemoveFavorite = async (placeId) => {
    try {
      await favoriteService.removeFavorite(placeId);
      setFavorites((prev) => prev.filter((f) => (f.place_id || f.id) !== placeId));
      showToast('Removed from saved wishlist', 'info');
    } catch {
      showToast('Failed to update wishlist', 'error');
    }
  };

  const userName = user?.name || 'Traveler';
  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=003E83&color=fff`;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-400 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading your travel space...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Top Breadcrumb */}
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Traveler Space' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome Traveler Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#003E83] via-[#0055b3] to-slate-900 text-white p-6 sm:p-10 shadow-xl overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={userAvatar}
                alt={userName}
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl object-cover ring-4 ring-white/20 shadow-lg"
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 backdrop-blur-md border border-white/20 text-blue-100">
                  <PlaneTakeoff size={13} />
                  <span>Kingdom of Wonder Explorer</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {userName}!
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/80 max-w-lg">
                  {user?.location ? `Exploring from ${user.location} • ` : ''}Manage your Cambodian itinerary, saved temple sanctuaries, and guided bookings.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={toggleChat}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Bot size={15} />
                <span>AI Travel Assistant</span>
              </button>
              <Link
                to="/profile"
                className="px-5 py-2.5 rounded-2xl bg-white text-[#003E83] hover:bg-blue-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <User size={15} />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => setActiveTab('bookings')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#003E83] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#003E83]'
                : 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Active Bookings
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
                <CalendarCheck size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {bookings.length}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Tours, guides & stays</span>
          </div>

          <div 
            onClick={() => setActiveTab('wishlist')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'border-[#003E83] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#003E83]'
                : 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Saved Wishlist
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
                <Heart size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {favorites.length}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Favorite destinations</span>
          </div>

          <div 
            onClick={() => setActiveTab('trips')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'trips'
                ? 'border-[#003E83] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#003E83]'
                : 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Custom Trips
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <Luggage size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {trips.length}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Planned itineraries</span>
          </div>

          <div 
            onClick={() => setActiveTab('achievements')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'border-[#003E83] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#003E83]'
                : 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Travel Badges
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {achievements.length || 3}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Unlocked milestones</span>
          </div>
        </div>

        {/* Tab Selection Filter */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Travel Space Overview', icon: Sparkles },
            { id: 'bookings', label: `My Bookings (${bookings.length})`, icon: CalendarCheck },
            { id: 'wishlist', label: `Saved Wishlist (${favorites.length})`, icon: Heart },
            { id: 'trips', label: `My Trips (${trips.length})`, icon: Luggage },
            { id: 'achievements', label: 'Badges & Stats', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSel
                    ? 'bg-[#003E83] text-white shadow-md'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Quick Travel Shortcuts Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/destinations"
                className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] transition-colors">
                      Browse Destinations
                    </h3>
                    <p className="text-[11px] text-gray-400">Temples & wonders</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/tours"
                className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] transition-colors">
                      Tour Packages
                    </h3>
                    <p className="text-[11px] text-gray-400">Handpicked circuits</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/guides"
                className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] transition-colors">
                      Local Tour Guides
                    </h3>
                    <p className="text-[11px] text-gray-400">Licensed Khmer guides</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/trips"
                className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Luggage size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] transition-colors">
                      Custom Itinerary
                    </h3>
                    <p className="text-[11px] text-gray-400">Plan day-by-day</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Recent Bookings Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Upcoming Bookings & Reservations
                  </h2>
                  <p className="text-xs text-gray-500">Your scheduled tours, excursions, and activities</p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
                >
                  View all ({bookings.length}) &rarr;
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-3">
                  <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">No active bookings yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Ready to discover Angkor Wat, sunset boat cruises, or local cooking classes? Explore our curated packages.
                  </p>
                  <Link
                    to="/tours"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] text-white text-xs font-bold rounded-2xl shadow-xs"
                  >
                    <span>Browse Tour Packages</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <CalendarCheck size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {item.title || item.tour?.title || item.business?.name || 'Guided Reservation'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : item.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}>
                              {item.status || 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span>Ref: #{item.booking_number || item.id}</span>
                            <span>•</span>
                            <span>Date: {item.booking_date || item.date || 'Upcoming'}</span>
                            <span>•</span>
                            <span>Guests: {item.number_of_guests || item.guests || 1}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center">
                        {item.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(item.id, item.title)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <Link
                          to={`/bookings`}
                          className="px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Wishlist Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Saved Places & Wishlist
                  </h2>
                  <p className="text-xs text-gray-500">Destinations you bookmarked for your itinerary</p>
                </div>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
                >
                  View all ({favorites.length}) &rarr;
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-3">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">No saved destinations yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Click the heart icon on any temple, island, or national park to save it here for quick access.
                  </p>
                  <Link
                    to="/destinations"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] text-white text-xs font-bold rounded-2xl shadow-xs"
                  >
                    <span>Explore Destinations</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.slice(0, 3).map((fav) => {
                    const place = fav.place || fav;
                    return (
                      <div
                        key={fav.id}
                        className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={place.image_url || place.cover_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'}
                            alt={place.name}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0"
                          />
                          <div className="overflow-hidden">
                            <Link
                              to={`/destinations/${place.id || fav.place_id}`}
                              className="text-xs font-bold text-gray-900 dark:text-white truncate block group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors"
                            >
                              {place.name || 'Cambodian Destination'}
                            </Link>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="text-amber-500" />
                              {place.province?.name || place.province || 'Cambodia'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(fav.place_id || fav.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommended Tours & Packages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Recommended Tours & Packages</span>
                  </h2>
                  <p className="text-xs text-gray-500">Handpicked multi-day itineraries and guided excursions</p>
                </div>
                <Link
                  to="/tours"
                  className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Explore all tours</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TOURS_DATA.slice(0, 3).map((tour) => (
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
            </div>

            {/* Cambodia Travel Practical Guide Widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-zinc-900 dark:to-zinc-900 border border-blue-100 dark:border-zinc-800 text-xs space-y-3 md:space-y-0">
              <div className="space-y-1">
                <span className="font-bold text-[#003E83] dark:text-blue-400 uppercase tracking-wider block text-[10px]">
                  Local Weather Today
                </span>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" /> Siem Reap: 32°C • Sunny & Clear
                </p>
                <p className="text-gray-500 text-[11px]">Ideal conditions for temple sunrise shoots</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#003E83] dark:text-blue-400 uppercase tracking-wider block text-[10px]">
                  Tourist Assistance
                </span>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Helpline: +855 23 214 743 (Police: 117)
                </p>
                <p className="text-gray-500 text-[11px]">Cambodia Ministry of Tourism 24/7 hotline</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#003E83] dark:text-blue-400 uppercase tracking-wider block text-[10px]">
                  Currency & Tipping
                </span>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                  USD & KHR (1 USD ≈ 4,100 Riel)
                </p>
                <p className="text-gray-500 text-[11px]">US Dollars & Bakong QR widely accepted</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  All Reservations & Bookings
                </h2>
                <p className="text-xs text-gray-500">Track confirmation status and manage reservations</p>
              </div>
              <Link
                to="/tours"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#003E83] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Plus size={14} /> Book New Tour
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-4">
                <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800 dark:text-white">No bookings found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  You haven't made any reservations yet. Browse our verified tour packages or hire an experienced local guide.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-gray-400">
                          #{booking.booking_number || `BK-${booking.id}`}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : booking.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}>
                          {booking.status || 'Pending'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {booking.title || booking.tour?.title || booking.business?.name || 'Guided Experience'}
                      </h3>

                      <div className="space-y-1.5 text-xs text-gray-500 mt-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-blue-500" />
                          <span>Date: {booking.booking_date || booking.date || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-purple-500" />
                          <span>Travelers: {booking.number_of_guests || 1} Person(s)</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white pt-1">
                          <span>Total Amount:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                            ${booking.total_price || booking.price || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                      {booking.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking.id, booking.title)}
                          className="px-4 py-2 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      )}
                      <Link
                        to="/bookings"
                        className="px-4 py-2 rounded-xl bg-[#003E83] text-white text-xs font-bold shadow-xs hover:bg-[#002e62] transition-colors"
                      >
                        Manage Booking
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Saved Destinations & Attractions
                </h2>
                <p className="text-xs text-gray-500">Places you have saved for upcoming trips</p>
              </div>
              <Link
                to="/destinations"
                className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
              >
                Explore more places &rarr;
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-3">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800 dark:text-white">Wishlist is empty</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Browse destinations and click the heart icon to save places you wish to visit.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((fav) => {
                  const place = fav.place || fav;
                  return (
                    <div
                      key={fav.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden shadow-xs group flex flex-col justify-between"
                    >
                      <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                        <img
                          src={place.image_url || place.cover_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(fav.place_id || fav.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 text-rose-500 shadow-md backdrop-blur-md hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <MapPin size={13} />
                          <span>{place.province?.name || place.province || 'Cambodia'}</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                          {place.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {place.description || 'Stunning Cambodian cultural and historical landmark.'}
                        </p>
                        <Link
                          to={`/destinations/${place.id || fav.place_id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline pt-1"
                        >
                          <span>View Details</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Custom Trips */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  My Planned Travel Trips
                </h2>
                <p className="text-xs text-gray-500">Day-by-day itineraries created by you</p>
              </div>
              <Link
                to="/trips"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#003E83] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Plus size={14} /> Create Trip Itinerary
              </Link>
            </div>

            {trips.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-3">
                <Luggage className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800 dark:text-white">No custom trips planned</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Use our interactive trip planner to organize dates, temples, hotels, and estimated budgets.
                </p>
                <Link
                  to="/trips"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] text-white text-xs font-bold rounded-2xl shadow-xs"
                >
                  <span>Start Planning</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400">
                        {trip.days || 3} Days Itinerary
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ${trip.budget || 250} Budget
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {trip.title || 'Cambodian Holiday Trip'}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {trip.description || 'Personalized itinerary across temples and attractions.'}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800">
                      <span className="text-[11px] text-gray-400">
                        {trip.itineraries?.length || 0} stops planned
                      </span>
                      <Link
                        to={`/trips/${trip.id}`}
                        className="text-xs font-bold text-[#003E83] dark:text-blue-400 hover:underline"
                      >
                        Open Planner &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Badges & Stats */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Explorer Achievements & Badges
              </h2>
              <p className="text-xs text-gray-500">Unlock travel badges as you explore the Kingdom of Wonder</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Angkor Wat Sunrise Witness', desc: 'Visited Angkor Wat during sunrise hours', icon: '🌅', unlocked: true },
                { title: 'Bayon Enigma Unlocked', desc: 'Explored the smiling stone faces of Jayavarman VII', icon: '🗿', unlocked: true },
                { title: 'Mekong River Voyager', desc: 'Took a cruise along the Tonle Sap & Mekong rivers', icon: '⛵', unlocked: true },
                { title: 'Cardamom Eco Ranger', desc: 'Trekked through the rainforests of Koh Kong', icon: '🌿', unlocked: false },
                { title: 'Island Hopper', desc: 'Swam with bioluminescent plankton in Koh Rong', icon: '🏝️', unlocked: false },
                { title: 'Master Reviewer', desc: 'Published 5 helpful traveler reviews for fellow tourists', icon: '⭐', unlocked: false },
              ].map((badge, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-3xl border transition-all ${
                    badge.unlocked
                      ? 'bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-900/40 shadow-xs'
                      : 'bg-gray-50/60 dark:bg-zinc-900/40 border-gray-200 dark:border-zinc-800 opacity-60'
                  }`}
                >
                  <div className="text-3xl mb-3">{badge.icon}</div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{badge.title}</h3>
                    {badge.unlocked && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tour Booking Modal */}
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
