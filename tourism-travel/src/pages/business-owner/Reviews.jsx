import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Star,
  Reply,
  CheckCircle2,
  Building2,
  X,
  MessageSquare,
  Filter
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function BusinessReviews() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError } = useAlert();
  const { searchTerm } = useSearch();

  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Reply Modal
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchReviews = useCallback(() => {
    if (!selectedBusiness?.id) return;
    setIsLoading(true);

    businessOwnerService
      .getReviews(selectedBusiness.id)
      .then((res) => {
        if (res?.success) {
          const list = res.data?.reviews || res.data || [];
          setReviews(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load reviews:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedBusiness]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleOpenReply = (rev) => {
    setReplyingReview(rev);
    setReplyText(rev.owner_reply || rev.reply || '');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingReview) return;

    setIsSubmittingReply(true);
    try {
      const res = await businessOwnerService.replyReview(selectedBusiness.id, replyingReview.id, replyText.trim());
      if (res?.success) {
        showSuccess('Your official reply has been published to this review.');
        setReplyingReview(null);
        setReplyText('');
        fetchReviews();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesRating = selectedRating === 'all' || String(r.rating) === String(selectedRating);
      const q = (searchTerm || '').toLowerCase();
      const matchesSearch =
        !q ||
        r.user?.name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q);
      return matchesRating && matchesSearch;
    });
  }, [reviews, selectedRating, searchTerm]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  if (!selectedBusiness) {
    return (
      <EmptyState
        icon={Building2}
        title="No business selected"
        description="Select a business to view customer reviews."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header Section (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Ratings & Reviews
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Monitor guest satisfaction, track ratings, and provide official business responses for {selectedBusiness.name}.
            </p>
          </div>
        </div>
      </div>

      {/* Rating Metric Strip (matching tourism-admin ratings bar) */}
      <div className="p-4 sm:p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {averageRating}
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className="fill-amber-400" />
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Based on {reviews.length} customer reviews recorded
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {['all', '5', '4', '3', '2', '1'].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              className={`px-3 py-1.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                selectedRating === star
                  ? 'bg-[#003E83] text-white border-[#003E83] shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/60'
              }`}
            >
              {star === 'all' ? (
                'All Ratings'
              ) : (
                <span className="flex items-center gap-1">
                  <span>{star} Star</span>
                  <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Loading customer reviews..." />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-12 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800">
          <EmptyState
            icon={Star}
            title="No reviews found"
            description="There are currently no reviews matching this filter rating or search term."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="p-4 sm:p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-zinc-700 flex items-center justify-center font-bold text-xs">
                    {r.user?.name ? r.user.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {r.user?.name || 'Tourist Guest'}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-zinc-500">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                  <Star size={12} className="fill-amber-400" />
                  <span>{r.rating || 5}.0</span>
                </div>
              </div>

              {r.title && (
                <h4 className="font-semibold text-xs text-gray-900 dark:text-white">
                  {r.title}
                </h4>
              )}

              <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                {r.comment}
              </p>

              {/* Owner Reply if exists */}
              {(r.owner_reply || r.reply) && (
                <div className="p-3 rounded-md bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs space-y-1">
                  <div className="font-semibold text-[#003E83] dark:text-blue-300 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={13} />
                    <span>Official Response from {selectedBusiness.name}:</span>
                  </div>
                  <p className="text-gray-700 dark:text-zinc-300 pl-4 text-xs">
                    {r.owner_reply || r.reply}
                  </p>
                </div>
              )}

              <div className="pt-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenReply(r)}
                  className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Reply size={13} />
                  <span>{r.owner_reply || r.reply ? 'Update Reply' : 'Reply to Review'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Official Reply to {replyingReview.user?.name || 'Customer'}
              </h3>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-md bg-gray-50 dark:bg-zinc-800 text-xs text-gray-600 dark:text-zinc-300 italic border border-gray-100 dark:border-zinc-700">
              "{replyingReview.comment}"
            </div>

            <form onSubmit={handleSendReply} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Your Response
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the guest for their visit and address any feedback..."
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-3.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="px-4 py-1.5 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs font-medium transition shadow-xs"
                >
                  {isSubmittingReply ? 'Publishing...' : 'Publish Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
