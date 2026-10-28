import { useState, useEffect } from 'react';
import { 
  Images, 
  Heart, 
  Eye, 
  MapPin, 
  X
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Galleries() {
  const { showSuccess } = useAlert();
  const [galleries, setGalleries] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGalleries = () => {
    setIsLoading(true);
    travelService.getGalleries()
      .then((res) => {
        if (res?.success) {
          const raw = res.data?.galleries || res.data?.data || res.data || [];
          setGalleries(Array.isArray(raw) ? raw : []);
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
  };

  useEffect(() => {
    loadGalleries();
  }, []);

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
      // Toggle locally on error
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
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-900 to-[#002D62] text-white p-8 sm:p-12 shadow-xl">
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/20">
            <Images size={13} className="text-amber-300" />
            <span>Media Database</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Photo & Media Gallery
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleries.map((photo) => {
            const photoUrl = photo.media_url || photo.url || photo.image;
            return (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative h-72 rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer"
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
                <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                  <h3 className="font-extrabold text-sm drop-shadow-sm line-clamp-1">
                    {photo.title}
                  </h3>

                  {photo.place && (
                    <div className="flex items-center gap-1 text-[11px] text-white/80">
                      <MapPin size={11} className="text-rose-400 shrink-0" />
                      <span className="truncate">{photo.place}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] text-white/70">
                    <span>{photo.photographer ? `By ${photo.photographer}` : 'AngkorVerses'}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Heart size={11} /> {photo.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={11} /> {photo.views_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

            <div className="w-full md:w-80 p-6 flex flex-col justify-between text-white border-t md:border-t-0 md:border-l border-zinc-800 space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-black leading-snug">
                  {activePhoto.title}
                </h3>
                {activePhoto.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activePhoto.description}
                  </p>
                )}
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
