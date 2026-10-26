import { useEffect } from 'react';
import { X, Check, Eye, User, Calendar, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getStatusColor, renderStars } from '../../utils/StatusUtils';

export default function ReviewDetailsModal({
  isOpen,
  review,
  onClose,
  onStatusChange
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen && review) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, review, onClose]);

  if (!isOpen || !review) return null;

  const avatarUrl = typeof review.avatar === 'string' && review.avatar.length > 0
    ? review.avatar
    : (typeof review.user === 'object' && typeof review.user?.avatar === 'string' ? review.user.avatar : null);
  const userName = typeof review.user === 'object' ? (review.user?.name || review.user_name || 'Traveler') : (review.user_name || review.user || 'Traveler');
  const userVerified = typeof review.user === 'object' ? review.user?.verified : review.is_verified;
  const placeName = typeof review.place === 'object' ? (review.place?.name || review.place_name || 'Attraction') : (review.place_name || review.place || 'Attraction');

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Review Details</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">ID: #{review.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-zinc-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
              )}
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{userName}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {review.date}
                </span>
                {userVerified && (
                  <span className="flex items-center gap-0.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]">
                    <Check className="w-3.5 h-3.5" />
                    Verified Traveler
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Place & Rating Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Attraction</span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {placeName}
              </p>
            </div>
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Rating & Status</span>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(review.status)}`}>
                  {review.status}
                </span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-1.5">
            <h4 className="font-semibold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{review.title}</h4>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] leading-relaxed">{review.comment}</p>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] block mb-2">Attached Photos</span>
              <div className="grid grid-cols-3 gap-2">
                {review.images.map((imgUrl, idx) => (
                  <div key={idx} className="h-20 rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-gray-100 dark:bg-zinc-800">
                    <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
              {review.likes || 0} helpful votes
            </span>
            <span className="flex items-center gap-1">
              <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
              {review.dislikes || 0} unhelpful votes
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)]">
          {review.status === 'Pending' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onStatusChange(review.id, 'Approved');
                  onClose();
                }}
                className="py-2 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusChange(review.id, 'Rejected');
                  onClose();
                }}
                className="py-2 px-3 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto py-2 px-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)] hover:bg-[var(--color-border-subtle-light)] dark:hover:bg-[var(--color-border-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
