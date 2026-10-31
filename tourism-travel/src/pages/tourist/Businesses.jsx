import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Star, 
  MapPin, 
  X, 
  CheckCircle2, 
  MessageSquare
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Businesses() {
  const { showSuccess, showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const ITEMS_PER_PAGE = 9;

  // Filter States
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedProvince = searchParams.get('province') || 'All';
  const minRating = Number(searchParams.get('rating') || 0);

  // Review & Details Modals
  const [selectedBusinessForReview, setSelectedBusinessForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [activeBusinessDetails, setActiveBusinessDetails] = useState(null);

  const loadData = () => {
    setIsLoading(true);

    Promise.allSettled([
      travelService.getBusinesses({ per_page: 50 }),
      travelService.getCategories(),
      travelService.getProvinces()
    ])
      .then(([bRes, cRes, pRes]) => {
        if (bRes.status === 'fulfilled' && bRes.value?.success) {
          const raw = bRes.value.data?.businesses || bRes.value.data?.data || bRes.value.data || [];
          setBusinesses(Array.isArray(raw) ? raw : []);
        } else {
          setBusinesses([]);
        }

        if (cRes.status === 'fulfilled' && cRes.value?.success) {
          const rawCat = cRes.value.data?.categories || cRes.value.data?.data || cRes.value.data || [];
          setCategories(Array.isArray(rawCat) ? rawCat : []);
        }

        if (pRes.status === 'fulfilled' && pRes.value?.success) {
          const rawProv = pRes.value.data?.provinces || pRes.value.data?.data || pRes.value.data || [];
          setProvinces(Array.isArray(rawProv) ? rawProv : []);
        }
      })
      .catch((err) => {
        console.error('Failed to load businesses from API:', err);
        setBusinesses([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All' || value === 0) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const filteredBusinesses = businesses.filter((b) => {
    const bName = b.name || '';
    const bDesc = b.description || '';
    const bCat = b.category?.name || (typeof b.category === 'string' ? b.category : '');
    const bProv = b.province?.name || (typeof b.province === 'string' ? b.province : '');

    if (search && !bName.toLowerCase().includes(search.toLowerCase()) && !bDesc.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'All' && bCat !== selectedCategory && String(b.category_id) !== selectedCategory) {
      return false;
    }
    if (selectedProvince !== 'All' && bProv !== selectedProvince && String(b.province_id) !== selectedProvince) {
      return false;
    }
    if (minRating > 0 && Number(b.rating || 0) < minRating) {
      return false;
    }
    return true;
  });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showError('Please write your review feedback.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await travelService.postBusinessReview(selectedBusinessForReview.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (res?.success) {
        showSuccess('Your review has been submitted successfully to the database.');
        setSelectedBusinessForReview(null);
        setReviewComment('');
        setReviewRating(5);
        loadData();
      } else {
        showError(res?.message || 'Failed to submit review.');
      }
    } catch (err) {
      showError(err?.message || 'Unable to post review to API.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedProvince, minRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Tourism Directory Database
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Registered Businesses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Browse verified tourism businesses and service providers registered in the database.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search business name, address, services..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            />
            {search && (
              <button 
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <select
              value={selectedProvince}
              onChange={(e) => handleFilterChange('province', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">All Provinces</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rating Filter & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-zinc-400">Min Rating:</span>
            {[0, 3, 4, 4.5, 5].map((starVal) => (
              <button
                key={starVal}
                type="button"
                onClick={() => handleFilterChange('rating', starVal === minRating ? 0 : starVal)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                  minRating === starVal
                    ? 'bg-[#002D62] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                {starVal === 0 ? 'Any' : (
                  <>
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span>{starVal}+</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="text-slate-500 dark:text-zinc-400">
            Total Database Records: <strong className="text-slate-800 dark:text-zinc-200">{filteredBusinesses.length}</strong>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <LoadingSpinner text="Querying database for businesses..." />
      ) : filteredBusinesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No businesses found in database"
          description="There are currently no business records matching this filter in the database."
          action={
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="px-4 py-2 rounded-xl bg-[#002D62] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBusinesses
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((b) => {
                const categoryName = b.category?.name || (typeof b.category === 'string' ? b.category : 'General Business');
                const provinceName = b.province?.name || (typeof b.province === 'string' ? b.province : b.address);
                const coverImage = b.cover_image_url || b.image || b.images?.[0]?.image_url;

                return (
                  <div
                    key={b.id}
                    className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo & Badges */}
                      <Link to={`/businesses/${b.id}`} className="block relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={b.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <Building2 size={32} />
                            <span className="text-[11px] mt-1">No Image Available</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-[#002D62]/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wide shadow-sm">
                            {categoryName}
                          </span>
                          {b.status && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                              <CheckCircle2 size={10} />
                              <span>{b.status}</span>
                            </span>
                          )}
                        </div>

                        {b.price_range && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                            {b.price_range}
                          </div>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="p-6 space-y-3.5">
                        <Link to={`/businesses/${b.id}`} className="block">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {b.name}
                          </h3>
                        </Link>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>{Number(b.rating || 0).toFixed(1)}</span>
                          </div>
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">
                            ({b.review_count || (b.reviews?.length || 0)} reviews)
                          </span>
                          {provinceName && (
                            <>
                              <span className="text-slate-300 dark:text-zinc-700">•</span>
                              <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 truncate">
                                <MapPin size={12} className="text-rose-500 shrink-0" />
                                <span className="truncate">{provinceName}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {b.description || 'No description provided.'}
                        </p>

                        {b.services && Array.isArray(b.services) && b.services.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {b.services.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {typeof s === 'string' ? s : s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                      <Link
                        to={`/businesses/${b.id}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition cursor-pointer"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedBusinessForReview(b)}
                        className="px-3.5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <MessageSquare size={13} />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            lastPage={Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE)}
            total={filteredBusinesses.length}
            perPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Review Modal */}
      {selectedBusinessForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  Post Review to Database
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  Review {selectedBusinessForReview.name}
                </h3>
              </div>
              <button onClick={() => setSelectedBusinessForReview(null)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-zinc-700'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {reviewRating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Your Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write your feedback to store into database..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedBusinessForReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting to DB...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Details Modal */}
      {activeBusinessDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeBusinessDetails.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  <MapPin size={13} className="text-rose-500" />
                  <span>{activeBusinessDetails.address || activeBusinessDetails.province?.name || 'Cambodia'}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveBusinessDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 space-y-2 text-xs text-slate-600 dark:text-zinc-300">
              <div><strong>Rating:</strong> {activeBusinessDetails.rating || 0} / 5 ({activeBusinessDetails.review_count || 0} reviews)</div>
              {activeBusinessDetails.phone && <div><strong>Phone:</strong> {activeBusinessDetails.phone}</div>}
              {activeBusinessDetails.email && <div><strong>Email:</strong> {activeBusinessDetails.email}</div>}
              {activeBusinessDetails.website && <div><strong>Website:</strong> {activeBusinessDetails.website}</div>}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Description</h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {activeBusinessDetails.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBusinessDetails(null)}
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
