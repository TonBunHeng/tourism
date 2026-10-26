import {
  Check,
  Star,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bot,
  Eye,
  X,
  Reply,
  FileText,
  User
} from 'lucide-react';

const getStatusColor = (status) => {
  const colors = {
    'Approved': 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]',
    'Published': 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]',
    'Pending': 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]',
    'Rejected': 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]',
    'Flagged': 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]',
    'Archived': 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-neutral-badge-border)] dark:bg-[var(--color-surface-hover-dark)]/50 dark:text-[var(--color-text-secondary-dark)] dark:border-[var(--color-border-dark)]'
  };
  return colors[status] || colors['Pending'];
};

const renderStars = (rating, size = 'sm') => {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${i < rating ? 'fill-[var(--color-warning-text)] text-[var(--color-warning-text)]' : 'text-[var(--color-border-subtle-light)] dark:text-[var(--color-border-dark)]'} ${starSize}`}
        />
      ))}
    </div>
  );
};

export default function ReviewsList({
  reviews,
  onViewDetails,
  onStatusChange,
  onOpenReplyModal
}) {
  return (
    <div className="divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
      {reviews.length > 0 ? (
        reviews.map((review) => {
          const userName = typeof review.user === 'object' ? review.user.name : review.user;
          const userVerified = typeof review.user === 'object' ? review.user.verified : review.verified;
          const placeName = typeof review.place === 'object' ? review.place.name : review.place;
          const placeLocation = typeof review.place === 'object' ? review.place.location : 'Cambodia';
          const repliesList = Array.isArray(review.replies) ? review.replies : [];
          const repliesCount = typeof review.replies === 'number' ? review.replies : repliesList.length;

          return (
            <div key={review.id} className="p-4 sm:p-6 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]" />
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm sm:text-base">{userName}</span>
                        {userVerified && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] rounded-md border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {renderStars(review.rating)}
                        <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">({review.rating}.0)</span>
                        <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] hidden sm:inline">•</span>
                        <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{placeName}</span>
                        <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] hidden sm:inline">•</span>
                        <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {placeLocation}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 flex-wrap shrink-0">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                      {review.featured && (
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-md border bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)] flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[var(--color-warning-text)] text-[var(--color-warning-text)]" /> Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badges: mobile row */}
                  <div className="flex sm:hidden items-center gap-2 flex-wrap mt-2">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                  </div>

                  <h4 className="font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-2 sm:mt-1">{review.title}</h4>
                  <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 line-clamp-2">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review image ${idx + 1}`}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <button className="flex items-center gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-success-text)] dark:hover:text-[var(--color-success-dark-text)] transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{review.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-danger-text)] dark:hover:text-[var(--color-danger-dark-text)] transition-colors">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{review.dislikes || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{repliesCount} replies</span>
                    </button>
                  </div>

                  {/* Replies thread */}
                  {repliesList.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                      {repliesList.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2 mt-2">
                          <div className="w-6 h-6 rounded-md bg-[var(--color-neutral-badge-border)] dark:bg-[var(--color-surface-hover-dark)] flex items-center justify-center text-xs flex-shrink-0">
                            <Bot className="w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{reply.user}</span>
                              <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">{reply.date}</span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">{reply.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="hidden sm:flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => onViewDetails(review)}
                    className="p-1.5 hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]" />
                  </button>
                  {review.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onStatusChange(review.id, 'Approved')}
                        className="p-1.5 hover:bg-[var(--color-success-bg)] dark:hover:bg-[var(--color-success-dark-bg)] rounded-md transition-colors cursor-pointer"
                        title="Approve"
                      >
                        <Check className="w-4 h-4 text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]" />
                      </button>
                      <button
                        onClick={() => onStatusChange(review.id, 'Rejected')}
                        className="p-1.5 hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                        title="Reject"
                      >
                        <X className="w-4 h-4 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onOpenReplyModal(review)}
                    className="p-1.5 hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-colors cursor-pointer"
                    title="Reply as Admin"
                  >
                    <Reply className="w-4 h-4 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No reviews found</h3>
          <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
