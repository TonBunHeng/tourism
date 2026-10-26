import { Star, ThumbsUp, ThumbsDown, Check, X, Eye, Clock, Calendar, Image as ImageIcon, MapPin, User, Reply, Trash2 } from 'lucide-react';
import { getStatusColor, renderStars } from '../../utils/StatusUtils';

export default function RatingsGrid({
  reviews = [],
  isLoading = false,
  onStatusChange,
  onViewDetails,
  onView,
  onReply,
  onDelete
}) {
  const handleView = (review) => {
    if (onView) onView(review);
    else if (onViewDetails) onViewDetails(review);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
        Loading ratings and reviews...
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No reviews found</h3>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
      {reviews.map((review) => {
        const avatarUrl = typeof review.avatar === 'string' && review.avatar.length > 0
          ? review.avatar
          : (typeof review.user === 'object' && typeof review.user?.avatar === 'string' ? review.user.avatar : null);
        const userName = typeof review.user === 'object' ? (review.user?.name || review.user_name || 'Traveler') : (review.user_name || review.user || 'Traveler');
        const userVerified = typeof review.user === 'object' ? review.user?.verified : review.is_verified;
        const placeName = typeof review.place === 'object' ? (review.place?.name || review.place_name || 'Attraction') : (review.place_name || review.place || 'Attraction');
        const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString() : (review.date || 'Recent');

        return (
          <div
            key={review.id}
            className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md p-4 flex flex-col justify-between shadow-xs"
          >
            {/* Header: User & Status */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-800">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">{userName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {reviewDate}
                      </span>
                      {userVerified && (
                        <span className="text-[10px] flex items-center gap-0.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] font-semibold">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border shrink-0 ${getStatusColor(review.status)}`}>
                  <Clock className="w-3 h-3" />
                  {review.status}
                </span>
              </div>

              {/* Place & Rating */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[var(--color-border-subtle-light)]/60 dark:border-[var(--color-border-dark)]/60">
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{placeName}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Content */}
              <div className="mt-3">
                {review.title && (
                  <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] line-clamp-1">{review.title}</p>
                )}
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] line-clamp-3 mt-1 leading-relaxed">{review.comment}</p>
              </div>

              {/* Photos */}
              {review.images && review.images.length > 0 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto">
                  {review.images.slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review photo ${idx + 1}`}
                      className="w-12 h-12 rounded-md object-cover border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                    />
                  ))}
                  {review.images.length > 3 && (
                    <span className="text-xs font-medium text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                      +{review.images.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions & Likes */}
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {review.likes || 0}
                </span>
                <span className="flex items-center gap-1 font-medium text-rose-500">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {review.dislikes || 0}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {review.status === 'Pending' && onStatusChange && (
                  <>
                    <button
                      type="button"
                      onClick={() => onStatusChange(review.id, 'Approved')}
                      className="p-1.5 text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] hover:bg-[var(--color-success-bg)] dark:hover:bg-[var(--color-success-dark-bg)] rounded-md transition-colors cursor-pointer"
                      title="Approve Review"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(review.id, 'Rejected')}
                      className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                      title="Reject Review"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                {onReply && (
                  <button
                    type="button"
                    onClick={() => onReply(review)}
                    className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleView(review)}
                  className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(review.id)}
                    className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
