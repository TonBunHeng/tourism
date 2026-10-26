import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { galleryService } from '../../services/galleryService';
import SimplePagination from '../../components/common/SimplePagination';
import GalleriesHeader from './GalleriesHeader';
import GalleryCard from '../../components/common/GalleryCard';
import MediaLightboxModal from '../../components/common/MediaLightboxModal';
import Breadcrumb from '../../components/common/Breadcrumb';

const isVideoItem = (item) => {
  if (!item) return false;
  const mediaType = (item.media_type || item.type || '').toLowerCase();
  if (mediaType === 'video') return true;
  const url = item.media_url || item.url || item.thumbnail_url || '';
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
};

export default function Galleries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'All';
  const page = Number(searchParams.get('page')) || 1;

  // Lightbox Modal state
  const [activeMedia, setActiveMedia] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        const res = await galleryService.getGalleries();
        if (res?.data) {
          setGalleries(res.data);
        }
      } catch (err) {
        console.error('Failed to load gallery', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  useEffect(() => {
    const handleLikeChanged = (e) => {
      const { mediaId, isLiked, likesCount } = e.detail || {};
      if (!mediaId) return;
      setGalleries((prev) =>
        prev.map((g) => {
          if (String(g.id) === String(mediaId)) {
            return {
              ...g,
              is_liked: isLiked,
              isLiked: isLiked,
              likes_count: likesCount,
            };
          }
          return g;
        })
      );
      setActiveMedia((prev) => {
        if (prev && String(prev.id) === String(mediaId)) {
          return {
            ...prev,
            is_liked: isLiked,
            isLiked: isLiked,
            likes_count: likesCount,
          };
        }
        return prev;
      });
    };

    window.addEventListener('angkor-gallery-like-changed', handleLikeChanged);
    return () => window.removeEventListener('angkor-gallery-like-changed', handleLikeChanged);
  }, []);

  const filteredGalleries = useMemo(() => {
    return galleries.filter((item) => {
      const matchSearch =
        search.trim() === '' ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.location?.toLowerCase().includes(search.toLowerCase()) ||
        item.place?.toLowerCase().includes(search.toLowerCase()) ||
        item.place_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase());

      const isVideo = isVideoItem(item);

      const matchFilter =
        filter === 'All' ||
        (filter === 'Photos' && !isVideo) ||
        (filter === 'Videos' && isVideo);

      return matchSearch && matchFilter;
    });
  }, [galleries, search, filter]);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredGalleries.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedGalleries = useMemo(() => {
    return filteredGalleries.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredGalleries, currentPage]);

  const handleFilterChange = (newFilter) => {
    const params = new URLSearchParams(searchParams);
    if (newFilter !== 'All') {
      params.set('filter', newFilter);
    } else {
      params.delete('filter');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val.trim()) {
      params.set('search', val.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreview = (item) => {
    setActiveMedia(item);
    setIsLightboxOpen(true);
  };

  const handleNavigateLightbox = (direction) => {
    if (!activeMedia) return;
    const currentIndex = filteredGalleries.findIndex((g) => g.id === activeMedia.id);
    if (direction === 'next' && currentIndex < filteredGalleries.length - 1) {
      setActiveMedia(filteredGalleries[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveMedia(filteredGalleries[currentIndex - 1]);
    }
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Media Gallery' }]} />
      <GalleriesHeader
        filter={filter}
        setFilter={handleFilterChange}
        search={search}
        setSearch={handleSearchChange}
        filters={['All', 'Photos', 'Videos']}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
          ))}
        </div>
      ) : paginatedGalleries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedGalleries.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              onPreview={handlePreview}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg space-y-3">
          <Camera className="w-10 h-10 text-gray-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No {filter === 'All' ? 'media' : filter.toLowerCase()} items found
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Try adjusting your search keywords or filter selection.
          </p>
          {(search || filter !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 bg-[#003E83] dark:bg-[#60a5fa] text-white dark:text-zinc-950 text-xs font-semibold rounded-md shadow-xs cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
        endIndex={Math.min(currentPage * ITEMS_PER_PAGE, filteredGalleries.length)}
        totalRecords={filteredGalleries.length}
        label="media items"
        className="rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs"
      />

      {/* Lightbox / Video Modal with Likes and Comments */}
      <MediaLightboxModal
        isOpen={isLightboxOpen}
        item={activeMedia}
        items={filteredGalleries}
        onClose={() => {
          setIsLightboxOpen(false);
          setActiveMedia(null);
        }}
        onNavigate={handleNavigateLightbox}
      />
    </div>
  );
}
