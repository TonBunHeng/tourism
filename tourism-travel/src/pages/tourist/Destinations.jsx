import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  X,
  Share2
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Destinations() {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 9 });
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Filters from query params
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const provinceId = searchParams.get('province') || '';
  const minRating = searchParams.get('rating') || '';
  const sortBy = searchParams.get('sort_by') || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    // Load categories & provinces
    Promise.allSettled([travelService.getCategories(), travelService.getProvinces()]).then(([catRes, provRes]) => {
      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.data?.categories || catRes.value.data || []);
      }
      if (provRes.status === 'fulfilled' && provRes.value?.success) {
        setProvinces(provRes.value.data?.provinces || provRes.value.data || []);
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      travelService.getFavorites().then((res) => {
        if (res?.success) {
          const list = res.data?.favorites || res.data || [];
          const ids = new Set(list.map((f) => f.place_id || f.id));
          setFavoriteIds(ids);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const query = {
      page,
      per_page: 9,
      sort_by: sortBy,
    };
    if (search) query.search = search;
    if (categoryId) query.category_id = categoryId;
    if (provinceId) query.province_id = provinceId;
    if (minRating) query.min_rating = minRating;

    travelService.getPlaces(query)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          setPlaces(res.data?.places || res.data || []);
          if (res.meta) {
            setPagination({
              current_page: res.meta.current_page || 1,
              last_page: res.meta.last_page || 1,
              total: res.meta.total || 0,
              per_page: res.meta.per_page || 9,
            });
          } else if (res.data?.pagination) {
            setPagination(res.data.pagination);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load places:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [search, categoryId, provinceId, minRating, sortBy, page]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset page on filter change
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleToggleFavorite = async (e, placeId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showError('Please sign in to save destinations to your personal favorites.');
      return;
    }

    try {
      const res = await travelService.toggleFavorite(placeId);
      if (res?.success) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (next.has(placeId)) {
            next.delete(placeId);
          } else {
            next.add(placeId);
          }
          return next;
        });
      }
    } catch {
      showError('Failed to update favorites. Please try again.');
    }
  };

  const handleShare = (e, place) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/destinations/${place.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showSuccess('Destination link copied to clipboard!', 'Shared');
    }
  };

  const hasActiveFilters = Boolean(search || categoryId || provinceId || minRating || sortBy !== 'popular');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
          Explore Cambodia
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Cambodian Tourist Destinations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Discover UNESCO temples, sandy beaches, eco-reserves, and cultural hotspots.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateParam('search', e.target.value.trim());
              }}
              onBlur={(e) => updateParam('search', e.target.value.trim())}
              placeholder="Search by name, temple, or city..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            />
          </div>

          {/* Province Filter */}
          <div>
            <select
              value={provinceId}
              onChange={(e) => updateParam('province', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="">All Provinces</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id || p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryId}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id || c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort_by', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="reviews">Sort: Most Reviews</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="newest">Sort: Newly Added</option>
            </select>
          </div>
        </div>

        {/* Rating filter & clear active tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-zinc-400">Min Rating:</span>
            {['', '4.5', '4.0', '3.5'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateParam('rating', r)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  minRating === r
                    ? 'border-[#002D62] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-[#002D62] dark:text-blue-400 font-bold'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {r ? (
                  <span className="flex items-center gap-1">
                    <span>{r}+</span>
                    <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                  </span>
                ) : (
                  'All Ratings'
                )}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X size={13} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Destinations Grid */}
      {isLoading ? (
        <LoadingSpinner text="Searching Cambodian destinations..." />
      ) : places.length === 0 ? (
        <EmptyState
          title="No destinations match your criteria"
          description="Try broadening your search term, clearing province filters, or resetting filters."
          action={
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-sm"
            >
              Show All Destinations
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {places.map((place) => {
            const isFav = favoriteIds.has(place.id);

            return (
              <Link
                key={place.id}
                to={`/destinations/${place.id}`}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo banner */}
                <div className="relative h-52 w-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={place.image_url || place.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80'}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002D62] text-white shadow-xs">
                      {place.category?.name || (typeof place.category === 'string' ? place.category : place.category_name) || 'Destination'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, place)}
                      className="p-1.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white transition cursor-pointer"
                      title="Share link"
                    >
                      <Share2 size={13} />
                    </button>

                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, place.id)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition cursor-pointer ${
                        isFav 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-black/50 hover:bg-black/75 text-white'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <Heart size={13} className={isFav ? 'fill-white' : ''} />
                    </button>
                  </div>

                  {place.rating && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-bold flex items-center gap-1">
                      <Star size={11} className="fill-amber-300" />
                      <span>{Number(place.rating).toFixed(1)}</span>
                      {place.reviews_count ? (
                        <span className="text-white/70 font-normal">({place.reviews_count})</span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-[#002D62] dark:text-blue-400 font-semibold mb-1">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{place.province?.name || (typeof place.province === 'string' ? place.province : place.province_name) || place.location || 'Cambodia'}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {place.description || 'Explore this historic landmark and experience authentic Cambodian culture.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-700 dark:text-zinc-200">
                      {place.entrance_fee || place.price ? (
                        <span>{place.entrance_fee || place.price}</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free Entry</span>
                      )}
                    </div>
                    <span className="px-4 py-2 rounded-xl bg-[#002D62] group-hover:bg-[#001f44] text-white font-bold transition shadow-xs text-xs">
                      Explore
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={pagination.per_page}
        onPageChange={(nextPage) => {
          const next = new URLSearchParams(searchParams);
          next.set('page', String(nextPage));
          setSearchParams(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
