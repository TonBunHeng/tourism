import { useState, useEffect, useCallback } from 'react';
import { 
  Images, 
  Heart, 
  Eye, 
  MapPin, 
  X,
  MessageSquare,
  Send
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const ITEMS_PER_PAGE = 9;

export default function Galleries() {
  const { showSuccess, showError } = useAlert();
  const [galleries, setGalleries] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [photoComments, setPhotoComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 9 });
  const [isLoading, setIsLoading] = useState(true);

  const loadGalleries = useCallback(() => {
    setIsLoading(true);
    travelService.getGalleries({ page: currentPage, per_page: ITEMS_PER_PAGE })
      .then((res) => {
        if (res?.success) {
          const raw = res.data?.galleries || res.data?.data || res.data || [];
          setGalleries(Array.isArray(raw) ? raw : []);
          setPagination({
            current_page: res.meta?.current_page || currentPage,
            last_page: res.meta?.last_page || 1,
            total: res.meta?.total || 0,
            per_page: res.meta?.per_page || ITEMS_PER_PAGE,
          });
        } else {
          setGalleries([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load gallery from API:', err);
        setGalleries([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage]);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  const handleToggleLike = async (photoId, e) => {
    if (e) e.stopPropagation();
    try {
      await travelService.likeGallery(photoId);
      showSuccess('Saved your like!');
      setGalleries((prev) => prev.map((item) => {
        if (item.id === photoId) {
          const wasLiked = item.is_liked;
          return {
            ...item,
            is_liked: !wasLiked,
            likes_count: (item.likes_count || 0) + (wasLiked ? -1 : 1)
          };
        }
        return item;
      }));
    } catch {
      showError('Unable to save your like. Please sign in and try again.');
    }
  };

  const handleOpenPhoto = (photo) => {
    setActivePhoto(photo);
    setPhotoComments([]);
    setNewComment('');

    // Register real view in database
    travelService.recordGalleryView(photo.id).catch(() => {});

    // Load comments
    travelService.getGalleryComments(photo.id).then((res) => {
      if (res?.success) {
        const cList = res.data?.comments || res.data || [];
        setPhotoComments(Array.isArray(cList) ? cList : []);
      }
    }).catch(() => {});
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activePhoto) return;

    setIsSubmittingComment(true);
    try {
      const res = await travelService.postGalleryComment(activePhoto.id, { comment: newComment.trim() });
      if (res?.success) {
        showSuccess('Comment posted!');
        setNewComment('');
        travelService.getGalleryComments(activePhoto.id).then((r) => {
          if (r?.success) {
            const list = r.data?.comments || r.data || [];
            setPhotoComments(Array.isArray(list) ? list : []);
          }
        });
      }
    } catch {
      showError('Please sign in to post comments.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const totalPages = pagination.last_page;
  const paginatedGalleries = galleries;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Media & Photography
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Photo & Media Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Browse published photos and media uploaded to the database.
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving gallery photos from database..." />
      ) : galleries.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No gallery media found in database"
          description="There are currently no published photos available in the gallery database."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedGalleries.map((photo) => {
              const photoUrl = photo.media_url || photo.url || photo.image;
              return (
                <div
                  key={photo.id}
                  onClick={() => handleOpenPhoto(photo)}
                  className="group relative h-80 rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Images size={32} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {photo.category && (
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        {photo.category}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(photo.id, e)}
                      className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
                        photo.is_liked ? 'bg-rose-500 text-white' : 'bg-black/50 text-white hover:bg-rose-500'
                      }`}
                    >
                      <Heart size={14} className={photo.is_liked ? 'fill-white' : ''} />
                    </button>
                  </div>

                  {/* Bottom Details */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                    <h3 className="font-extrabold text-base drop-shadow-sm line-clamp-1">
                      {photo.title}
                    </h3>

                    {photo.place && (
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <MapPin size={12} className="text-rose-400 shrink-0" />
                        <span className="truncate">{photo.place}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-white/70">
                      <span>{photo.photographer ? `By ${photo.photographer}` : 'AngkorVerses'}</span>
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1 font-semibold">
                          <Heart size={12} /> {photo.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Eye size={12} /> {photo.views_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            lastPage={totalPages}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-alert-backdrop">
          <div className="relative max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white"
            >
              <X size={20} />
            </button>

            <div className="flex-1 max-h-[70vh] md:max-h-[80vh] flex items-center justify-center bg-black">
              <img
                src={activePhoto.media_url || activePhoto.url || activePhoto.image}
                alt={activePhoto.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="w-full md:w-96 p-6 flex flex-col justify-between text-white border-t md:border-t-0 md:border-l border-zinc-800 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black leading-snug">
                    {activePhoto.title}
                  </h3>
                  {activePhoto.place && (
                    <div className="text-xs text-rose-400 flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{activePhoto.place}</span>
                    </div>
                  )}
                  {activePhoto.description && (
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {activePhoto.description}
                    </p>
                  )}
                </div>

                {/* Comments Section */}
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                    <MessageSquare size={14} />
                    <span>Traveler Comments ({photoComments.length})</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {photoComments.length === 0 ? (
                      <p className="text-[11px] text-zinc-500 italic">No comments yet. Share your thoughts!</p>
                    ) : (
                      photoComments.map((c, idx) => (
                        <div key={c.id || idx} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-zinc-400 font-bold">
                            <span>{c.user?.name || c.user_name || 'Traveler'}</span>
                            <span className="text-[10px]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-zinc-200">{c.comment || c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={handlePostComment} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(activePhoto.id, e)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activePhoto.is_liked
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  <Heart size={14} className={activePhoto.is_liked ? 'fill-white' : ''} />
                  <span>{activePhoto.likes_count || 0} Likes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
