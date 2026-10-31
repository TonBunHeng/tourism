import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Eye,
  Image as ImageIcon,
  MapPin,
  User,
  Reply,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { getStatusColor, renderStars } from '../../utils/StatusUtils';
import { useLanguage } from '../../i18n';

export default function RatingsTable({
  reviews = [],
  isLoading = false,
  onStatusChange,
  onViewDetails,
  onView,
  onReply,
  onDelete,
  startIndex = 0
}) {
  const { t } = useLanguage();

  const handleView = (review) => {
    if (onView) onView(review);
    else if (onViewDetails) onViewDetails(review);
  };

  const safeReviews = reviews || [];

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Approved': return t('ratings.statusApproved', 'Approved');
      case 'Pending': return t('ratings.statusPending', 'Pending');
      case 'Rejected': return t('ratings.statusRejected', 'Rejected');
      case 'Published': return t('ratings.statusPublished', 'Published');
      case 'Flagged': return t('ratings.statusFlagged', 'Flagged');
      case 'Archived': return t('ratings.statusArchived', 'Archived');
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
        {t('ratings.loadingRatings', 'Loading ratings and reviews...')}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card List View */}
      <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {safeReviews.length > 0 ? (
          safeReviews.map((review) => {
            const avatarUrl = typeof review.avatar === 'string' && review.avatar.length > 0
              ? review.avatar
              : (typeof review.user === 'object' && typeof review.user?.avatar === 'string' ? review.user.avatar : null);
            const userName = typeof review.user === 'object' ? (review.user?.name || review.user_name || t('ratings.anonymousTraveler', 'Traveler')) : (review.user_name || review.user || t('ratings.anonymousTraveler', 'Traveler'));
            const userVerified = typeof review.user === 'object' ? review.user?.verified : review.is_verified;
            const placeName = typeof review.place === 'object' ? (review.place?.name || review.place_name || t('ratings.attractionFallback', 'Attraction')) : (review.place_name || review.place || t('ratings.attractionFallback', 'Attraction'));
            const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString() : (review.date || t('ratings.recentFallback', 'Recent'));

            return (
              <div
                key={review.id}
                onClick={() => handleView(review)}
                className="p-4 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                          {userName}
                        </p>
                        {userVerified && (
                          <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 rounded-md shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${getStatusColor(review.status)}`}>
                        {getStatusLabel(review.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] ml-0.5">
                          {Number(review.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                        • {reviewDate}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{placeName}</span>
                    </p>

                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] line-clamp-2 mt-1">
                      {review.comment || review.title || t('ratings.noComment', 'No comment provided.')}
                    </p>

                    <div
                      className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                          <ThumbsUp className="w-3.5 h-3.5" /> {review.likes || 0}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-rose-500">
                          <ThumbsDown className="w-3.5 h-3.5" /> {review.dislikes || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {review.status === 'Pending' && onStatusChange && (
                          <>
                            <button
                              type="button"
                              onClick={() => onStatusChange(review.id, 'Approved')}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors cursor-pointer"
                              title={t('ratings.tooltipApprove', 'Approve Review')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onStatusChange(review.id, 'Rejected')}
                              className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                              title={t('ratings.tooltipReject', 'Reject Review')}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {onReply && (
                          <button
                            type="button"
                            onClick={() => onReply(review)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('ratings.tooltipReply', 'Reply')}
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleView(review)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('ratings.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(review.id)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('ratings.tooltipDelete', 'Delete Review')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
              {t('ratings.noReviewsFound', 'No reviews found')}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('ratings.tryAdjustingFilter', 'Try adjusting your search or filter criteria')}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Responsive Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-auto">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
            <tr>
              <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                {t('ratings.thIndex', '#')}
              </th>
              <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('ratings.thReviewUser', 'Review & User')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-44">
                {t('ratings.thTargetPlace', 'Target Place')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                {t('ratings.thRating', 'Rating')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
                {t('ratings.thDate', 'Date')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                {t('ratings.thStatus', 'Status')}
              </th>
              <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-28 whitespace-nowrap">
                {t('ratings.thActions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            {safeReviews.length > 0 ? (
              safeReviews.map((review, index) => {
                const avatarUrl = typeof review.avatar === 'string' && review.avatar.length > 0
                  ? review.avatar
                  : (typeof review.user === 'object' && typeof review.user?.avatar === 'string' ? review.user.avatar : null);
                const userName = typeof review.user === 'object' ? (review.user?.name || review.user_name || t('ratings.anonymousTraveler', 'Traveler')) : (review.user_name || review.user || t('ratings.anonymousTraveler', 'Traveler'));
                const userVerified = typeof review.user === 'object' ? review.user?.verified : review.is_verified;
                const placeName = typeof review.place === 'object' ? (review.place?.name || review.place_name || t('ratings.attractionFallback', 'Attraction')) : (review.place_name || review.place || t('ratings.attractionFallback', 'Attraction'));
                const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString() : (review.date || t('ratings.recentFallback', 'Recent'));

                return (
                  <tr
                    key={review.id}
                    className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
                  >
                    <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5 min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {userName}
                            </p>
                            {userVerified && (
                              <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 rounded-md">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] line-clamp-1 mt-0.5">
                            {review.title || review.comment}
                          </p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                              <ImageIcon className="w-3 h-3" />{' '}
                              {review.images.length === 1
                                ? t('ratings.photosCountSingle', '1 photo')
                                : t('ratings.photosCount', '{count} photos').replace('{count}', review.images.length)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <div className="flex items-center gap-1 max-w-[160px] truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate font-medium">{placeName}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)] shrink-0" />
                        <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {Number(review.rating || 0).toFixed(1)}
                        </span>
                        {review.likes > 0 && (
                          <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                            ({review.likes})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                      {reviewDate}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(review.status)}`}>
                        {getStatusLabel(review.status)}
                      </span>
                    </td>

                    <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(review)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('ratings.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onReply && (
                          <button
                            type="button"
                            onClick={() => onReply(review)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('ratings.tooltipReply', 'Reply')}
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        )}
                        {review.status === 'Pending' && onStatusChange && (
                          <>
                            <button
                              type="button"
                              onClick={() => onStatusChange(review.id, 'Approved')}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors cursor-pointer"
                              title={t('ratings.tooltipApprove', 'Approve Review')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onStatusChange(review.id, 'Rejected')}
                              className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                              title={t('ratings.tooltipReject', 'Reject Review')}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(review.id)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('ratings.tooltipDelete', 'Delete Review')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12 px-4">
                  <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                    {t('ratings.noReviewsFound', 'No reviews found')}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {t('ratings.tryAdjustingFilter', 'Try adjusting your search or filter criteria')}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
