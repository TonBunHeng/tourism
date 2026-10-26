import { useState } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useAlert } from '../../context/AlertContext';

export default function ReviewModal({ isOpen, onClose, place, onReviewSubmitted }) {
  const { showSuccess, showError } = useAlert();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !place) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback comment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reviewService.createReview({
        place_id: place.id,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        visit_date: visitDate || undefined,
      });

      setTitle('');
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
      showSuccess(`Thank you for reviewing "${place.name}"! Your feedback helps fellow travelers.`, 'Review Submitted');
    } catch (err) {
      setError(err.message || 'Failed to submit review. Try again.');
      showError(err.message || 'Failed to submit review.', 'Review Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden zoom-in p-6 space-y-4 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Leave Feedback</span>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Review {place.name}</h2>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-zinc-700'
                    } transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-gray-700 dark:text-zinc-300">{rating}.0 / 5.0</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Headline / Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Unforgettable sunrise experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Your Review *</label>
            <textarea
              rows={3}
              required
              placeholder="Share what you liked, tips for other tourists, dress codes, transport..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Date of Visit (Optional)</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
