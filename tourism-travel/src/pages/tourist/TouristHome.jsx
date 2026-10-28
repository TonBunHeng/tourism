import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Star, 
  Calendar, 
  ArrowRight, 
  ChevronRight,
  Compass,
  Heart,
  Users
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
  const [userBookings, setUserBookings] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [catRes, provRes, featRes, popRes] = await Promise.allSettled([
          travelService.getCategories(),
          travelService.getProvinces(),
          travelService.getPlaces({ featured: true, per_page: 6 }),
          travelService.getPlaces({ sort_by: 'popular', per_page: 8 }),
        ]);

        if (isMounted) {
          if (catRes.status === 'fulfilled' && catRes.value?.success) {
            setCategories(catRes.value.data?.categories || catRes.value.data || []);
          }
          if (provRes.status === 'fulfilled' && provRes.value?.success) {
            setProvinces(provRes.value.data?.provinces || provRes.value.data || []);
          }
          if (featRes.status === 'fulfilled' && featRes.value?.success) {
            setFeaturedPlaces(featRes.value.data?.places || featRes.value.data || []);
          }
          if (popRes.status === 'fulfilled' && popRes.value?.success) {
            setPopularPlaces(popRes.value.data?.places || popRes.value.data || []);
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

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#003E83] via-[#002e62] to-[#0a192f] text-white pt-16 pb-24 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100 mb-6 shadow-sm">
            <Sparkles size={14} className="text-amber-300" />
            <span>
              {isAuthenticated ? `Welcome back, ${user?.name || 'Explorer'}!` : 'Official Kingdom of Cambodia Tourism'}
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
                placeholder="Search temples, hotels, activities..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003E83]"
              />
            </div>

            {/* Province Selector */}
            <div className="w-full md:w-48">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#003E83]"
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
                className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#003E83]"
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
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Quick Action Navigation Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-10 relative z-10">
          <Link
            to="/ai-chat"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center mb-3 shadow-md">
              <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>AI Tourism Guide</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">RAG</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Ask questions, plan 3-day itineraries & check weather.
              </div>
            </div>
          </Link>

          <Link
            to="/destinations"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003E83] to-blue-600 text-white flex items-center justify-center mb-3 shadow-md">
              <Compass size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                All Destinations
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Filter by provinces, admission fees, and visitor ratings.
              </div>
            </div>
          </Link>

          <Link
            to={isAuthenticated ? "/bookings" : "/login"}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-3 shadow-md">
              <Calendar size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                My Bookings
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {isAuthenticated ? `${userBookings.length} upcoming or past bookings` : 'Track your tours & reservations'}
              </div>
            </div>
          </Link>

          <Link
            to={isAuthenticated ? "/favorites" : "/login"}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-xl hover:border-rose-400 dark:hover:border-rose-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center mb-3 shadow-md">
              <Heart size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Saved Wishlist
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {isAuthenticated ? `${userFavorites.length} favorite places saved` : 'Save places you want to visit'}
              </div>
            </div>
          </Link>
        </section>

        {/* User Activity / Upcoming Bookings Banner (if logged in and has bookings) */}
        {isAuthenticated && userBookings.length > 0 && (
          <section className="p-5 sm:p-6 rounded-3xl bg-blue-50/70 dark:bg-zinc-900/80 border border-blue-200 dark:border-blue-900/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#003E83] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Your Recent & Upcoming Travel Reservations
                </h3>
              </div>
              <Link to="/bookings" className="text-xs font-semibold text-[#003E83] dark:text-blue-400 hover:underline flex items-center gap-1">
                <span>View All ({userBookings.length})</span>
                <ChevronRight size={14} />
              </Link>
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

        {/* Featured Destinations Showcase */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#003E83] dark:text-blue-400">
                Hand-picked Highlights
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Featured Cambodian Heritage & Wonders
              </h2>
            </div>
            <Link
              to="/destinations?featured=true"
              className="text-xs font-semibold text-[#003E83] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Loading featured destinations..." />
          ) : featuredPlaces.length === 0 ? (
            <EmptyState title="No featured destinations yet" description="Check back soon for curated travel highlights." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#003E83] text-white shadow-md">
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
                        <MapPin size={13} className="text-[#003E83] dark:text-blue-400 shrink-0" />
                        <span>{place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || place.location || 'Cambodia'}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {place.description || 'Experience the historical and cultural significance of this remarkable Cambodian destination.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-700 dark:text-zinc-300">
                        {place.entrance_fee || place.price ? (
                          <span>{place.entrance_fee || place.price}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Free Admission</span>
                        )}
                      </div>
                      <Link
                        to={`/destinations/${place.id}`}
                        className="inline-flex items-center gap-1 font-bold text-[#003E83] dark:text-blue-400 hover:underline"
                      >
                        <span>View Details</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Travel Assistant Feature Callout */}
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

        {/* Popular Destinations List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#003E83] dark:text-blue-400">
                Visitor Favorites
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Most Visited Attractions Across Cambodia
              </h2>
            </div>
            <Link
              to="/destinations?sort=popular"
              className="text-xs font-semibold text-[#003E83] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={14} />
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
                  <div className="text-[10px] font-semibold text-[#003E83] dark:text-blue-400 mb-0.5">
                    {place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || 'Cambodia'}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {place.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                    {place.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
