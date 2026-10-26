import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel,
  Plane,
  Train,
  Car,
  Ticket,
  Luggage,
  MapPin,
  Calendar,
  User,
  Search,
  Check,
  ChevronDown,
  ShieldCheck,
  Gift,
  Award,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

export default function HomeHero() {
  const navigate = useNavigate();
  const { provinces } = useTravel();

  // Active Tab: 'hotels' | 'flights' | 'trains' | 'cars' | 'tours' | 'packages'
  const [activeTab, setActiveTab] = useState('hotels');

  // Search Fields
  const [destination, setDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  // Guest & Room Stepper State
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Quick Filters
  const [freeCancellation, setFreeCancellation] = useState(true);
  const [specialDiscounts, setSpecialDiscounts] = useState(false);

  const guestDropdownRef = useRef(null);

  // Close guest dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(e.target)) {
        setGuestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute number of nights
  const calculateNights = () => {
    try {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const cleanDest = destination.trim();

    if (cleanDest) {
      params.append('search', cleanDest);
      const matched = provinces.find(
        (p) => p.name?.toLowerCase() === cleanDest.toLowerCase()
      );
      if (matched) {
        params.append('province_id', String(matched.id));
      }
    }

    if (activeTab === 'tours') {
      navigate(`/tours?${params.toString()}`);
    } else if (activeTab === 'cars') {
      navigate(`/businesses?category=transport&${params.toString()}`);
    } else if (activeTab === 'flights') {
      navigate(`/destinations?${params.toString()}`);
    } else if (activeTab === 'trains') {
      navigate(`/trips?${params.toString()}`);
    } else {
      // Hotels & default
      navigate(`/places?${params.toString()}`);
    }
  };

  const quickTrendingDestinations = [
    'Siem Reap',
    'Angkor Wat',
    'Phnom Penh',
    'Koh Rong',
    'Kampot & Kep',
    'Battambang'
  ];

  return (
    <section className="relative pt-4 sm:pt-6 pb-8 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Royal Blue Hero Banner Container */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#003882] via-[#004eb6] to-[#002766] text-white pt-10 sm:pt-14 pb-28 sm:pb-36 px-4 sm:px-8 text-center shadow-lg">
        {/* Subtle Ambient Lighting and Silhouette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(40,125,250,0.3)_0,_transparent_60%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-black tracking-tight text-white leading-tight">
            Every check-in is a new beginning
          </h1>

          {/* Trust Guarantee Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-1 text-xs sm:text-sm font-semibold text-blue-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>We price match</span>
            </span>
            <span className="text-blue-300/60 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Gift size={16} className="text-amber-400" />
              <span>Hotel booking guarantee</span>
            </span>
            <span className="text-blue-300/60 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Award size={16} className="text-sky-300" />
              <span>Hotel stay guarantee</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating Trip.com White Search Console Box */}
      <div className="relative -mt-20 sm:-mt-24 z-20 max-w-5xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-6 transition-all">
        
        {/* Channel Search Tabs */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'hotels', name: 'Hotels & Homes', icon: Hotel },
            { id: 'flights', name: 'Flights', icon: Plane },
            { id: 'trains', name: 'Trains', icon: Train },
            { id: 'cars', name: 'Cars', icon: Car },
            { id: 'tours', name: 'Attractions & Tours', icon: Ticket },
            { id: 'packages', name: 'Flight + Hotel', icon: Luggage },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-1.5 pb-2 px-2.5 sm:px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'text-[#287dfa] dark:text-blue-400'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-[#0f294d] dark:hover:text-white'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#287dfa] dark:text-blue-400 scale-105'
                      : 'text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                </div>
                <span>{tab.name}</span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#287dfa] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Input Fields Bar */}
        <form onSubmit={handleHeroSearch} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-gray-200 dark:border-zinc-700 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-zinc-700 overflow-visible bg-white dark:bg-zinc-900">
            
            {/* 1. Destination Column */}
            <div className="lg:col-span-5 p-3 sm:p-3.5 relative">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1">
                Where to?
              </label>
              <div className="flex items-center gap-2.5">
                <MapPin size={18} className="text-[#287dfa] shrink-0" />
                <input
                  type="text"
                  list="cambodia-destinations"
                  placeholder="Siem Reap, Angkor, Phnom Penh, Koh Rong..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold text-[#0f294d] dark:text-white bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
                />
                <datalist id="cambodia-destinations">
                  {provinces.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                  <option value="Angkor Wat, Siem Reap" />
                  <option value="Pub Street, Siem Reap" />
                  <option value="Royal Palace, Phnom Penh" />
                  <option value="Koh Rong Island" />
                  <option value="Bokor National Park, Kampot" />
                </datalist>
              </div>
            </div>

            {/* 2. Check-in & Check-out Date Column */}
            <div className="lg:col-span-4 p-3 sm:p-3.5 relative">
              <div className="flex items-center justify-between mb-1 pl-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Dates
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#287dfa] dark:bg-zinc-800 dark:text-blue-400 border border-blue-100 dark:border-zinc-700">
                  {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#287dfa] shrink-0" />
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0f294d] dark:text-white w-full">
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-xs font-semibold w-1/2"
                  />
                  <span className="text-gray-300 dark:text-zinc-600">-</span>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-xs font-semibold w-1/2"
                  />
                </div>
              </div>
            </div>

            {/* 3. Rooms & Guests Dropdown Column */}
            <div className="lg:col-span-3 p-3 sm:p-3.5 relative" ref={guestDropdownRef}>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1">
                Guests & Rooms
              </label>
              <button
                type="button"
                onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <User size={18} className="text-[#287dfa] shrink-0" />
                  <span className="text-xs sm:text-[13px] font-bold text-[#0f294d] dark:text-white truncate">
                    {rooms} room, {adults + children} guests
                  </span>
                </div>
                <ChevronDown size={14} className="text-gray-400 shrink-0 ml-1" />
              </button>

              {/* Guest Stepper Popover */}
              {guestDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-4 z-50 animate-in fade-in space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Rooms</div>
                      <div className="text-[11px] text-gray-400">Number of rooms</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        disabled={rooms <= 1}
                        className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(rooms + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-gray-100 dark:border-zinc-800 pt-3">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Adults</div>
                      <div className="text-[11px] text-gray-400">Ages 18 or above</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                        className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-gray-100 dark:border-zinc-800 pt-3">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Children</div>
                      <div className="text-[11px] text-gray-400">Ages 0 - 17</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                        className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGuestDropdownOpen(false)}
                    className="w-full py-2 bg-[#287dfa] text-white rounded-xl font-bold text-xs hover:bg-[#1a6de8] transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Under Search Controls: Quick Filters & Search CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            {/* Quick Filter Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 dark:text-zinc-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={freeCancellation}
                  onChange={(e) => setFreeCancellation(e.target.checked)}
                  className="rounded text-[#287dfa] focus:ring-blue-400 w-4 h-4 cursor-pointer"
                />
                <span>Free cancellation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={specialDiscounts}
                  onChange={(e) => setSpecialDiscounts(e.target.checked)}
                  className="rounded text-[#287dfa] focus:ring-blue-400 w-4 h-4 cursor-pointer"
                />
                <span className="text-amber-600 dark:text-amber-400 font-bold">Special discounts</span>
              </label>
            </div>

            {/* Trip.com Signature Blue Search Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-3.5 bg-[#287dfa] hover:bg-[#1a6de8] text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Trending Destinations Bar */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">Popular:</span>
          {quickTrendingDestinations.map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => {
                setDestination(dest);
                navigate(`/places?search=${encodeURIComponent(dest)}`);
              }}
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:text-[#287dfa] dark:hover:text-blue-400 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {dest}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
