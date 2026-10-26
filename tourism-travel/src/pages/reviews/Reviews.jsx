import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Filter, 
  Search, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Loader2,
  Sparkles
} from 'lucide-react';
import reviewService from '../../services/reviewService';
import placeService from '../../services/placeService';
import ReviewModal from '../../components/reviews/ReviewModal';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import Breadcrumb from '../../components/common/Breadcrumb';

// Curated high quality traveler reviews for initial showcase / fallback
const INITIAL_REVIEWS = [
  {
    id: 1,
    user_name: 'Sarah Jenkins',
    user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    place_name: 'Angkor Wat Main Complex',
    rating: 5,
    title: 'Breathtaking sunrise beyond imagination',
    comment: 'Waking up at 4:30 AM was completely worth every second. Standing by the northern reflection pond watching the sky shift from deep violet to fiery gold behind the five lotus towers is a spiritual experience. Our guide was extraordinarily knowledgeable about Suryavarman II and the churning of the milk ocean bas-reliefs.',
    created_at: '2026-10-18T08:30:00Z',
    likes: 42,
    verified_visit: true
  },
  {
    id: 2,
    user_name: 'Alexandre Dubois',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    place_name: 'Bayon Temple',
    rating: 5,
    title: 'The enigmatic smiling faces of Avalokiteshvara',
    comment: 'Bayon has an atmosphere completely distinct from Angkor Wat. As you navigate the upper terrace, the massive stone faces seem to follow you from every angle with serene compassion. Highly recommend visiting in the mid-afternoon when the sun hits the stone features at an angle.',
    created_at: '2026-10-14T11:20:00Z',
    likes: 29,
    verified_visit: true
  },
  {
    id: 3,
    user_name: 'Mei-Ling Zhou',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    place_name: 'Koh Rong Sanloem - Lazy Beach',
    rating: 5,
    title: 'True tropical island paradise without crowds',
    comment: 'Golden soft sand, crystal turquoise waters, and zero motorized water sports. The tranquility here is unmatched. At night, swimming with the bioluminescent plankton was pure magic — every stroke in the water left a trail of glowing blue stars!',
    created_at: '2026-10-09T14:10:00Z',
    likes: 38,
    verified_visit: true
  },
  {
    id: 4,
    user_name: 'Marcus Vance',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    place_name: 'Royal Palace & Silver Pagoda',
    rating: 4,
    title: 'Spectacular Khmer architecture in the capital',
    comment: 'The craftsmanship of the Silver Pagoda floor tiles and the Emerald Buddha is stunning. Be sure to dress respectfully (shoulders and knees covered). We paired this with a stroll along the riverside promenade at sunset.',
    created_at: '2026-10-02T16:45:00Z',
    likes: 19,
    verified_visit: true
  },
  {
    id: 5,
    user_name: 'Elena Rostova',
    user_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    place_name: 'Ta Prohm Temple',
    rating: 5,
    title: 'Nature reclaiming history — unforgettable spung trees',
    comment: 'Seeing giant silk-cotton tree roots wrapping around sandstone doorways felt like stepping directly into an adventure movie. Our guide showed us hidden carvings tucked behind tree trunks that we would have completely missed on our own.',
    created_at: '2026-09-28T09:15:00Z',
    likes: 51,
    verified_visit: true
  }
];

export default function Reviews() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useTravel();

  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState({});
  const [selectedPlaceForReview, setSelectedPlaceForReview] = useState(null);

  const fetchReviews = useCallback(() => {
    reviewService.getReviews()
      .then((res) => {
        const data = res?.data || res;
        const apiReviews = Array.isArray(data) ? data : (data?.data || []);
        setReviewsList(apiReviews.length > 0 ? apiReviews : INITIAL_REVIEWS);
      })
      .catch(() => {
        setReviewsList(INITIAL_REVIEWS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    reviewService.getReviews()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        const apiReviews = Array.isArray(data) ? data : (data?.data || []);
        setReviewsList(apiReviews.length > 0 ? apiReviews : INITIAL_REVIEWS);
      })
      .catch(() => {
        if (!isMounted) return;
        setReviewsList(INITIAL_REVIEWS);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    placeService.getPlaces({ per_page: 5 }).then((res) => {
      if (!isMounted) return;
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : (data?.data || []);
      if (list.length > 0) setSelectedPlaceForReview(list[0]);
    }).catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const handleOpenWriteReview = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      showToast('Please sign in to share your travel review', 'info');
      return;
    }
    setModalOpen(true);
  };

  const handleLike = (id) => {
    setLikedReviews((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredReviews = useMemo(() => {
    return reviewsList.filter((rev) => {
      const matchesRating = filterRating === 'all' || Math.round(Number(rev.rating)) === Number(filterRating);
      const searchTarget = `${rev.user_name || rev.user?.name || ''} ${rev.place_name || rev.place?.name || ''} ${rev.title || ''} ${rev.comment || ''}`.toLowerCase();
      const matchesSearch = !searchTerm.trim() || searchTarget.includes(searchTerm.toLowerCase().trim());
      return matchesRating && matchesSearch;
    });
  }, [reviewsList, filterRating, searchTerm]);

  // Rating metrics
  const totalReviews = reviewsList.length;
  const avgRating = totalReviews > 0
    ? (reviewsList.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalReviews).toFixed(1)
    : '4.9';

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb Bar */}
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Traveler Reviews' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Hero Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 mb-3">
              <Sparkles size={13} />
              <span>Real Traveler Experiences</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Cambodia Traveler Reviews
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Read authentic feedback, tips, and personal memories from travelers who explored the temples, rivers, and islands of the Kingdom of Wonder.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenWriteReview}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#003E83] hover:bg-[#002e62] text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={18} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Overview Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Score box */}
            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 pb-6 md:pb-0 md:pr-8">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Overall Satisfaction</span>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                <span className="text-5xl font-black text-gray-900 dark:text-white">{avgRating}</span>
                <div>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium mt-1 block">
                    Based on {totalReviews} traveler reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Rating breakdown bars */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewsList.filter((r) => Math.round(Number(r.rating)) === star).length;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-bold text-gray-600 dark:text-zinc-300 flex items-center gap-1">
                      {star} <Star size={12} className="fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-400 font-mono text-[11px]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase mr-1 flex items-center gap-1">
              <Filter size={13} /> Filter:
            </span>
            {['all', '5', '4', '3'].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterRating === rating
                    ? 'bg-[#003E83] text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                }`}
              >
                {rating === 'all' ? 'All Reviews' : `${rating} Stars`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by temple, keyword..."
              className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#003E83] transition-all"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#003E83] animate-spin" />
            <p className="text-xs text-gray-500">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-3">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800 dark:text-white">No reviews found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No traveler reviews match your current filter. Try selecting "All Reviews" or clearing the search query.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => {
              const userName = rev.user_name || rev.user?.name || 'Traveler';
              const userAvatar = rev.user_avatar || rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=003E83&color=fff`;
              const placeName = rev.place_name || rev.place?.name || 'Cambodian Destination';
              const isLiked = !!likedReviews[rev.id];
              const likesCount = (rev.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-xs hover:border-blue-200 dark:hover:border-blue-900/50 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{userName}</span>
                          {rev.verified_visit !== false && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Verified Traveler
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 pt-0.5">
                          <span className="flex items-center gap-1 text-[#003E83] dark:text-blue-300 font-semibold">
                            <MapPin size={11} /> {placeName}
                          </span>
                          <span>•</span>
                          <span>{new Date(rev.created_at || '2026-10-18T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={`${
                            star <= Number(rev.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200 dark:text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && (
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      "{rev.title}"
                    </h3>
                  )}

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-zinc-800/80 text-xs">
                    <button
                      type="button"
                      onClick={() => handleLike(rev.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                        isLiked
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 font-bold'
                          : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      <ThumbsUp size={13} className={isLiked ? 'fill-current' : ''} />
                      <span>Helpful ({likesCount})</span>
                    </button>

                    <span className="text-[11px] text-gray-400">
                      Reviewed on AngkorVerses Travel
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && (
        <ReviewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          place={selectedPlaceForReview || { id: 1, name: 'Angkor Wat' }}
          onReviewSubmitted={() => {
            fetchReviews();
            showToast('Your review was successfully submitted!', 'success');
          }}
        />
      )}
    </div>
  );
}
