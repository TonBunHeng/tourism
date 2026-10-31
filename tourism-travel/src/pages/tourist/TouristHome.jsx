import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Star, 
  Calendar, 
  Compass,
  Heart,
  Users,
  Store,
  Clock,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Route,
  PhoneCall,
  DollarSign,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import travelService from '../../services/travelService';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function TouristHome() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [events, setEvents] = useState([]);
  const [tours, setTours] = useState([]);
  const [settings, setSettings] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [
          catRes, 
          provRes, 
          featRes, 
          popRes,
          bizRes,
          evRes,
          tourRes,
          setRes
        ] = await Promise.allSettled([
          travelService.getCategories(),
          travelService.getProvinces(),
          travelService.getPlaces({ featured: true, per_page: 6 }),
          travelService.getPlaces({ sort_by: 'popular', per_page: 8 }),
          travelService.getBusinesses({ per_page: 4 }),
          travelService.getEvents({ per_page: 3 }),
          travelService.getTours({ per_page: 3 }),
          travelService.getSettings(),
        ]);

        if (isMounted) {
          if (catRes.status === 'fulfilled' && catRes.value?.success) {
            setCategories(catRes.value.data?.categories || catRes.value.data || []);
          }
          if (provRes.status === 'fulfilled' && provRes.value?.success) {
            setProvinces(provRes.value.data?.provinces || provRes.value.data || []);
          }
          if (featRes.status === 'fulfilled' && featRes.value?.success) {
            const fList = featRes.value.data?.places || featRes.value.data?.data || featRes.value.data || [];
            setFeaturedPlaces(Array.isArray(fList) ? fList : []);
          }
          if (popRes.status === 'fulfilled' && popRes.value?.success) {
            const pList = popRes.value.data?.places || popRes.value.data?.data || popRes.value.data || [];
            setPopularPlaces(Array.isArray(pList) ? pList : []);
          }
          if (bizRes.status === 'fulfilled' && bizRes.value?.success) {
            const bList = bizRes.value.data?.businesses || bizRes.value.data?.data || (Array.isArray(bizRes.value.data) ? bizRes.value.data : []);
            setBusinesses(Array.isArray(bList) ? bList : []);
          }
          if (evRes.status === 'fulfilled' && evRes.value?.success) {
            const eList = evRes.value.data?.events || evRes.value.data?.data || (Array.isArray(evRes.value.data) ? evRes.value.data : []);
            const list = Array.isArray(eList) ? eList : [];
            const sortedEvents = [...list].sort((a, b) => {
              const aMatch = (a.title || '').toLowerCase().includes('phare circus');
              const bMatch = (b.title || '').toLowerCase().includes('phare circus');
              if (aMatch && !bMatch) return -1;
              if (!aMatch && bMatch) return 1;
              return 0;
            });
            setEvents(sortedEvents);
          }
          if (tourRes.status === 'fulfilled' && tourRes.value?.success) {
            const tList = tourRes.value.data?.tours || tourRes.value.data?.data || (Array.isArray(tourRes.value.data) ? tourRes.value.data : []);
            setTours(Array.isArray(tList) ? tList : []);
          }
          if (setRes.status === 'fulfilled' && setRes.value?.success) {
            setSettings(setRes.value.data?.data || setRes.value.data || null);
          }
        }

        if (isAuthenticated && isMounted) {
          const [bookRes, favRes] = await Promise.allSettled([
            travelService.getBookings(),
            travelService.getFavorites(),
          ]);
          if (bookRes.status === 'fulfilled' && bookRes.value?.success) {
            const list = bookRes.value.data?.bookings || bookRes.value.data || [];
            setUserBookings(Array.isArray(list) ? list.slice(0, 3) : []);
          }
          if (favRes.status === 'fulfilled' && favRes.value?.success) {
            const favs = favRes.value.data?.favorites || favRes.value.data || [];
            setUserFavorites(Array.isArray(favs) ? favs.slice(0, 4) : []);
          }
        }
      } catch (err) {
        console.warn('Error loading tourist home data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedProvince) params.set('province', selectedProvince);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/destinations?${params.toString()}`);
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return { month: 'TBA', day: '--' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { month: 'TBA', day: '--' };
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      return { month, day };
    } catch {
      return { month: 'TBA', day: '--' };
    }
  };

  const emergencyContacts = settings?.emergency_contacts || {
    police: '117',
    tourist_police: '+855 31 322 2117',
    ambulance: '119',
    fire: '118',
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002D62] via-[#001f44] to-[#0a192f] text-white pt-16 pb-24 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100 mb-6 shadow-sm">
            <Sparkles size={14} className="text-amber-300" />
            <span>
              {isAuthenticated ? `Welcome back, ${user?.name || 'Explorer'}!` : 'Official Kingdom of Cambodia Tourism Portal'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
            Discover the Wonders of{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Cambodia
            </span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Explore majestic UNESCO World Heritage temples in Angkor, scenic mountain plateaus, tropical coastal beaches, and vibrant Khmer traditions.
          </p>

          {/* Integrated Search Box */}
          <form 
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-white/20 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 flex flex-col md:flex-row gap-2 items-center"
          >
            {/* Search Query Input */}
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search temples, hotels, tours, activities..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
              />
            </div>

            {/* Province Selector */}
            <div className="w-full md:w-48">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
              >
                <option value="">All Provinces</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id || p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="w-full md:w-44">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Search size={16} />
              <span>Search Places</span>
            </button>
          </form>

          {/* Quick Prompts under search */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-blue-200">
            <span className="font-semibold text-amber-300">Popular searches:</span>
            {['Angkor Wat Sunrise', 'Siem Reap Night Market', 'Koh Rong Beaches', 'Bokor National Park'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  navigate(`/destinations?search=${encodeURIComponent(tag)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 2. Quick Action Navigation Gateway (6 Core Capabilities) */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 -mt-10 relative z-10">
          <Link
            to="/ai-chat"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center mb-2.5 shadow-xs">
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <span>AI Guide</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">RAG</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                Smart assistant
              </div>
            </div>
          </Link>

          <Link
            to="/destinations"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#002D62] to-blue-600 text-white flex items-center justify-center mb-2.5 shadow-xs">
              <Compass size={18} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Destinations
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                Heritage & nature
              </div>
            </div>
          </Link>

          <Link
            to="/trips"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mb-2.5 shadow-xs">
              <Route size={18} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Trip Planner
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                Custom itineraries
              </div>
            </div>
          </Link>

          <Link
            to="/tours"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-2.5 shadow-xs">
              <Clock size={18} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Tour Packages
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                Curated circuits
              </div>
            </div>
          </Link>

          <Link
            to="/events"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center mb-2.5 shadow-xs">
              <Calendar size={18} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Festivals
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                Cultural events
              </div>
            </div>
          </Link>

          <Link
            to="/businesses"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-cyan-400 dark:hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center mb-2.5 shadow-xs">
              <Store size={18} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Local Business
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                Hotels & dining
              </div>
            </div>
          </Link>
        </section>

        {/* 3. User Activity / Upcoming Bookings Banner (if logged in and has bookings) */}
        {isAuthenticated && userBookings.length > 0 && (
          <section className="p-5 sm:p-6 rounded-3xl bg-blue-50/70 dark:bg-zinc-900/80 border border-blue-200 dark:border-blue-900/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#002D62] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Your Recent & Upcoming Travel Reservations
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {userFavorites.length > 0 && (
                  <Link
                    to="/favorites"
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold transition text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Heart size={13} className="fill-rose-500 text-rose-500" />
                    <span>Wishlist ({userFavorites.length})</span>
                  </Link>
                )}
                <Link
                  to="/bookings"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition text-xs shadow-xs"
                >
                  View All ({userBookings.length})
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400">
                      #{b.booking_reference || b.id}
                    </span>
                    <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'neutral'}>
                      {b.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {b.service?.name || b.business?.name || b.tour?.title || 'Tour Reservation'}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400 shrink-0" />
                      <span>{b.booking_date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-slate-400 shrink-0" />
                      <span>{b.guests_count || b.number_of_guests || 1} guest(s)</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Curated Tour Packages Section */}
        {tours.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#002D62] dark:text-blue-400 flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Guided Journeys</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Curated Tour Packages & Circuits
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Multi-day guided temple expeditions, Mekong river discoveries, and island escapes.
                </p>
              </div>
              <Link
                to="/tours"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition text-xs shadow-xs shrink-0"
              >
                All Packages
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tours.slice(0, 3).map((tour) => (
                <div
                  key={tour.id}
                  className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={tour.image || tour.image_url || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80'}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#002D62]/90 backdrop-blur-md text-white shadow-md">
                        {tour.duration || `${tour.durationDays || 2} Days`}
                      </span>
                    </div>
                    {tour.rating && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Star size={12} className="fill-amber-300" />
                        <span>{Number(tour.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                        <MapPin size={13} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                        <span>{tour.province || tour.destination || 'Siem Reap, Cambodia'}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {tour.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {tour.description || 'All-inclusive guided tour package covering major highlights, transport, and certified local guides.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">Starting from</div>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          ${tour.price ? Number(tour.price).toFixed(0) : '85'}
                          <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400"> / person</span>
                        </div>
                      </div>
                      <Link
                        to="/tours"
                        className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs"
                      >
                        View Tour
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Featured Destinations Showcase */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#002D62] dark:text-blue-400">
                Hand-picked Highlights
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Featured Cambodian Heritage & Wonders
              </h2>
            </div>
            <Link
              to="/destinations?featured=true"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition text-xs shadow-xs"
            >
              Explore All
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Loading featured destinations..." />
          ) : featuredPlaces.length === 0 ? (
            <EmptyState title="No featured destinations yet" description="Check back soon for curated travel highlights." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPlaces.map((place) => (
                <div
                  key={place.id}
                  className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col"
                >
                  {/* Image container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={place.image_url || place.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#002D62] text-white shadow-md">
                        {place.category?.name || (typeof place.category === 'string' ? place.category : place.category_name) || 'Heritage'}
                      </span>
                    </div>
                    {place.rating && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Star size={12} className="fill-amber-300" />
                        <span>{Number(place.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Place Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                        <MapPin size={13} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                        <span>{place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || place.location || 'Cambodia'}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {place.description || 'Experience the historical and cultural significance of this remarkable Cambodian destination.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-700 dark:text-zinc-300">
                        {place.entrance_fee || place.price ? (
                          <span>{place.entrance_fee || place.price}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Free Admission</span>
                        )}
                      </div>
                      <Link
                        to={`/destinations/${place.id}`}
                        className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Trip Planner & Achievements Dual Spotlight Banner */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Trip Planner */}
          <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/40 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-md">
                <Route size={24} />
              </div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                Personalized Itineraries
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Design Your Multi-Day Trip
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6">
                Organize stops across Siem Reap, Phnom Penh, or Battambang. Calculate daily budgets, timeline activities, and share itineraries with fellow travelers.
              </p>
            </div>
            <div className="relative z-10">
              <Link
                to="/trips"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-md transition"
              >
                <span>Open Trip Planner</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Card B: Travel Achievements */}
          <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#002D62] dark:bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md">
                <Trophy size={24} />
              </div>
              <div className="text-xs font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
                Gamified Exploration
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Unlock Angkor Explorer Badges
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6">
                Collect digital achievements by visiting UNESCO monuments, trying Khmer culinary delicacies, booking verified local experiences, and reviewing destinations.
              </p>
            </div>
            <div className="relative z-10">
              <Link
                to="/achievements"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs sm:text-sm font-bold shadow-md transition"
              >
                <span>View Badges & Points</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Upcoming Cultural Festivals & Events Section */}
        {events.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#002D62] dark:text-blue-400 flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Cultural Calendar</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Upcoming Festivals & Celebrations
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Experience traditional Khmer ceremonies, boat racing festivals, and vibrant music events.
                </p>
              </div>
              <Link
                to="/events"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition text-xs shadow-xs shrink-0"
              >
                View All Events
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.slice(0, 2).map((event) => {
                const dateParts = formatEventDate(event.start_date || event.date);
                return (
                  <div
                    key={event.id}
                    className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        {/* Date badge */}
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-[#002D62] dark:text-blue-400 flex flex-col items-center justify-center shrink-0 shadow-xs">
                          <span className="text-[10px] font-black uppercase tracking-wider">{dateParts.month}</span>
                          <span className="text-lg font-black leading-none">{dateParts.day}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 mt-1.5">
                            {event.category || 'Cultural Festival'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                          <span className="truncate">{event.location || event.province || 'Cambodia'}</span>
                        </div>
                        {event.organizer && (
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                            <span className="truncate">Organized by {event.organizer}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {event.description || 'Join local communities and visitors in honoring Cambodian traditional festivities.'}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {event.price ? event.price : 'Free Admission'}
                      </span>
                      <Link
                        to="/events"
                        className="px-3.5 py-1.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 8. AI Travel Assistant Feature Callout */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles size={14} />
              <span>Grounded Tourism AI Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Plan Your Dream Trip to Cambodia with AI
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mb-6 font-light">
              Get instant answers about dress codes for Angkor Wat, best sunrise spots, local Tuk-Tuk transport rates, currency conversion (USD/KHR), and customized 3-day travel itineraries.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/ai-chat"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg transition flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>Chat with AI Assistant Now</span>
              </Link>
              <Link
                to="/ai-chat?tab=itinerary"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-semibold transition"
              >
                Generate 3-Day Itinerary
              </Link>
            </div>
          </div>
        </section>

        {/* 9. Verified Business Partners & Local Establishments */}
        {businesses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#002D62] dark:text-blue-400 flex items-center gap-1.5">
                  <Store size={14} />
                  <span>Hospitality & Services</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Verified Local Business Partners
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Trusted boutique hotels, traditional Khmer cuisine, transportation, and artisan shops.
                </p>
              </div>
              <Link
                to="/businesses"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition text-xs shadow-xs shrink-0"
              >
                Business Directory
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {businesses.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <Link to={`/businesses/${b.id}`} className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800 block">
                    <img
                      src={b.cover_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002D62]/90 backdrop-blur-md text-white shadow-xs">
                        {b.category?.name || 'Local Service'}
                      </span>
                    </div>
                    {b.rating && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Star size={11} className="fill-amber-300" />
                        <span>{Number(b.rating).toFixed(1)}</span>
                        {b.review_count > 0 && <span className="text-[10px] text-white/80 font-normal">({b.review_count})</span>}
                      </div>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                        <MapPin size={12} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                        <span className="truncate">{b.province?.name || b.address || 'Cambodia'}</span>
                      </div>
                      <Link to={`/businesses/${b.id}`}>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {b.name}
                        </h4>
                      </Link>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {b.description || 'Verified local business welcoming international travelers.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">
                        {b.price_range || '$$'}
                      </div>
                      <Link
                        to={`/businesses/${b.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. Popular Destinations List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#002D62] dark:text-blue-400">
                Visitor Favorites
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Most Visited Attractions Across Cambodia
              </h2>
            </div>
            <Link
              to="/destinations?sort=popular"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition text-xs shadow-xs"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularPlaces.map((place) => (
              <Link
                key={place.id}
                to={`/destinations/${place.id}`}
                className="group rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 mb-3">
                  <img
                    src={place.image_url || place.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80'}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {place.rating && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                      <Star size={10} className="fill-amber-300" />
                      <span>{Number(place.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-[#002D62] dark:text-blue-400 mb-0.5">
                    {place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || 'Cambodia'}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {place.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                    {place.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 truncate">
                    {place.entrance_fee || place.price || 'Free Admission'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#002D62] group-hover:bg-[#001f44] text-white text-[10px] font-bold transition shadow-xs flex items-center gap-1 shrink-0">
                    <span>Details</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 11. Essential Travel Intelligence & Emergency Strip */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <ShieldCheck size={16} />
                <span>Official Traveler Advisory</span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">
                Essential Cambodia Travel Guidelines & Hotlines
              </h3>
            </div>
            <Link
              to="/support"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition flex items-center gap-2 self-start md:self-auto"
            >
              <Info size={14} />
              <span>Visitor Support Center</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-300">
            {/* Widget 1: Emergency Numbers */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-bold text-white flex items-center gap-2 text-sm">
                <PhoneCall size={16} className="text-rose-400" />
                <span>Emergency Numbers</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Tourist Police:</span>
                  <span className="font-bold text-amber-300">{emergencyContacts.tourist_police || '117'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">National Police:</span>
                  <span className="font-bold text-white">{emergencyContacts.police || '117'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Ambulance:</span>
                  <span className="font-bold text-white">{emergencyContacts.ambulance || '119'}</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Currency & Money */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-bold text-white flex items-center gap-2 text-sm">
                <DollarSign size={16} className="text-emerald-400" />
                <span>Currency & Cash</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                US Dollars (USD) and Cambodian Riel (KHR) are accepted everywhere. Current standard rate is approximately 4,100 KHR = \$1 USD. Bakong KHQR is widely used.
              </p>
            </div>

            {/* Widget 3: Temple Etiquette */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-bold text-white flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-blue-400" />
                <span>Temple Etiquette</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Dress respectfully: shoulders and knees must be covered inside Angkor Wat and Royal Palace. Remove hats and sunglasses before entering pagoda sanctuaries.
              </p>
            </div>

            {/* Widget 4: Official Helpline */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-bold text-white flex items-center gap-2 text-sm">
                <Info size={16} className="text-amber-400" />
                <span>Ministry Support</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {settings?.organization_name || 'Ministry of Tourism & Culture Cambodia'}
              </p>
              <div className="pt-1 text-[11px] space-y-0.5 text-slate-400 font-mono">
                <div>Tel: {settings?.support_phone || '+855 23 888 999'}</div>
                <div className="truncate">Email: {settings?.support_email || 'support@tourism.gov.kh'}</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
