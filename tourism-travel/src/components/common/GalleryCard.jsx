import { useState, useEffect } from 'react';
import { MapPin, Heart, ArrowRight, Camera, Play } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';
import { galleryService } from '../../services/galleryService';

const isVideoItem = (item) => {
  if (!item) return false;
  if (item.media_type?.toLowerCase() === 'video' || item.type?.toLowerCase() === 'video') return true;
  const url = item.media_url || item.url || item.thumbnail_url || '';
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
};

export default function GalleryCard({ item, onPreview }) {
  const { showToast } = useTravel();
  const [isLiked, setIsLiked] = useState(() =>
    galleryService.isMediaLiked(item.id, item.is_liked || false)
  );
  const [likesCount, setLikesCount] = useState(() =>
    galleryService.getMediaLikesCount(item.id, item.likes_count || 0)
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLiked(galleryService.isMediaLiked(item.id, item.is_liked || false));
    setLikesCount(galleryService.getMediaLikesCount(item.id, item.likes_count || 0));

    const handleLikeChanged = (e) => {
      if (e.detail && String(e.detail.mediaId) === String(item.id)) {
        setIsLiked(e.detail.isLiked);
        setLikesCount(e.detail.likesCount);
      }
    };

    window.addEventListener('angkor-gallery-like-changed', handleLikeChanged);
    return () => window.removeEventListener('angkor-gallery-like-changed', handleLikeChanged);
  }, [item.id, item.is_liked, item.likes_count]);

  const isVideo = isVideoItem(item);
  const mediaUrl = item.media_url || item.url || '';

  const handleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await galleryService.toggleLike(item.id, {
        is_liked: isLiked,
        likes_count: likesCount,
      });
      if (res) {
        setIsLiked(res.is_liked);
        setLikesCount(res.likes_count);
        showToast(res.is_liked ? 'Liked!' : 'Unliked', 'success');
      }
    } catch {
      showToast('Failed to update like', 'error');
    }
  };

  const handleClick = () => {
    if (onPreview) onPreview(item);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Cover Photo or Video Thumbnail */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-900 flex items-center justify-center">
          {isVideo ? (
            <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center">
              <video
                src={mediaUrl ? `${mediaUrl}#t=0.5` : ''}
                poster={item.thumbnail_url || item.thumbnail || item.poster || item.cover_image || undefined}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              {/* Video Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors">
                <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-zinc-900/90 text-[#003E83] dark:text-[#60a5fa] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt={item.title || 'Angkor photo'}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80';
              }}
            />
          )}

          {/* Category / Type Tag */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-white/95 dark:bg-zinc-900/95 text-gray-800 dark:text-zinc-200 shadow-xs border border-gray-100 dark:border-zinc-800 flex items-center gap-1">
              {isVideo ? (
                <>
                  <Play className="w-3 h-3 text-[#003E83] dark:text-[#60a5fa] fill-current" />
                  <span>Video {item.duration ? `(${item.duration})` : ''}</span>
                </>
              ) : (
                <>
                  <Camera className="w-3 h-3 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>{item.category || 'Photo'}</span>
                </>
              )}
            </span>
          </div>

          {/* Like Button */}
          <button
            type="button"
            onClick={handleLike}
            className={`absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold shadow-xs transition-all ${
              isLiked
                ? 'bg-rose-500 text-white'
                : 'bg-white/95 dark:bg-zinc-900/95 text-gray-700 dark:text-zinc-300 hover:text-rose-500 border border-gray-100 dark:border-zinc-800'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa] shrink-0" />
              <span className="truncate">{item.location || item.province || item.place || 'Cambodia'}</span>
            </span>

            {item.author && (
              <span className="text-[11px] text-gray-400 dark:text-zinc-500 truncate max-w-[110px]">
                {item.author}
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-[#60a5fa] transition-colors line-clamp-1">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end text-xs">
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-1 font-semibold text-[#003E83] dark:text-[#60a5fa] hover:underline cursor-pointer"
        >
          <span>{isVideo ? 'Play Video & Comment' : 'View & Comment'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
