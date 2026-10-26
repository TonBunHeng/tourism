import { useEffect } from 'react';
import { X, Send } from 'lucide-react';

export default function ReviewReplyModal({
  isOpen,
  review,
  onClose,
  replyText = '',
  setReplyText,
  onReplyTextChange,
  onSubmit,
  onSendReply
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

  const userName = typeof review.user === 'object' ? (review.user?.name || review.user_name || 'Traveler') : (review.user_name || review.user || 'Traveler');
  const reviewComment = review.comment || '';

  const handleTextChange = (val) => {
    if (onReplyTextChange) onReplyTextChange(val);
    if (setReplyText) setReplyText(val);
  };

  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else if (onSendReply) {
      onSendReply(review.id);
    }
  };

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Reply to Review</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Direct response to traveler</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/40 rounded-md border border-gray-200 dark:border-zinc-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Review by <span className="text-gray-900 dark:text-zinc-100 font-bold">{userName}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                "{reviewComment}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Your Official Reply
              </label>
              <textarea
                value={replyText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Write your response as Admin..."
                rows="4"
                required
                className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-surface-hover-dark)] border border-gray-300 dark:border-zinc-700 rounded-md px-3.5 py-2.5 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-1 focus:ring-[#003E83] resize-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-6 py-4 border-t border-gray-200 dark:border-zinc-800 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-md border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium text-xs sm:text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="flex-1 py-2.5 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-colors text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Send Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
