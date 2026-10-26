import { useState } from 'react';
import { Image as ImageIcon, Video, Eye, X, Play } from 'lucide-react';

const isVideoItem = (item) => {
  if (!item) return false;
  if (item.type?.toLowerCase() === 'video') return true;
  const url = item.url || item.media_url || '';
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
};

export default function GalleriesGrid({ mediaList, loading }) {
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-4/3 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 transition-colors">
        <ImageIcon className="w-10 h-10 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No media items found</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Please check back later or try adjusting filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {mediaList.map((item) => {
          const isVideo = isVideoItem(item);
          const mediaUrl = item.url || item.media_url;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group relative aspect-4/3 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
            >
              {isVideo ? (
                <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center">
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 text-[#003E83] dark:text-[#60a5fa] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={mediaUrl}
                  alt={item.title || item.place || 'AngkorVerses photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}

              {/* Overlay Ribbon */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 text-white">
                <div className="self-end">
                  <span className="p-1 rounded bg-black/60 flex items-center gap-1 text-[10px] font-semibold">
                    {isVideo ? <Video className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3" />}
                    {isVideo ? 'Video' : 'View'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold truncate">
                    {item.title || item.place || 'Gallery Media'}
                  </h4>
                  {item.caption && (
                    <p className="text-[10px] text-gray-300 truncate">{item.caption}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Video Player Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 fade-in"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-zinc-800 zoom-in transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedMedia.title || selectedMedia.place || 'Photo & Media View'}
                </h3>
                {selectedMedia.caption && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedMedia.caption}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1 rounded-md text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
              {isVideoItem(selectedMedia) ? (
                <video
                  src={selectedMedia.url || selectedMedia.media_url}
                  controls
                  autoPlay
                  className="max-h-[75vh] w-full object-contain"
                />
              ) : (
                <img
                  src={selectedMedia.url || selectedMedia.media_url}
                  alt={selectedMedia.title || 'Preview'}
                  className="max-h-[75vh] w-full object-contain"
                />
              )}
            </div>

            <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
              <span>
                {selectedMedia.place ? `Location: ${selectedMedia.place}` : (selectedMedia.category ? `Category: ${selectedMedia.category}` : 'AngkorVerses Media')}
              </span>
              <a
                href={selectedMedia.url || selectedMedia.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003E83] dark:text-[#60a5fa] hover:underline font-semibold"
              >
                Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
