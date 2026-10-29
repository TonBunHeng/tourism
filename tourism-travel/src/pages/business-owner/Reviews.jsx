import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Star, 
  Reply, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function BusinessReviews() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError } = useAlert();

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

    businessOwnerService.getReviews(selectedBusiness.id)
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

  const filteredReviews = reviews.filter((r) => {
    if (selectedRating === 'all') return true;
    return String(r.rating) === String(selectedRating);
  });

  const averageRating = reviews.length > 0 
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
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
          Reputation & Reviews ({selectedBusiness.name})
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Customer Reviews & Verified Replies
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Monitor guest ratings and provide verified owner responses to feedback.
        </p>
      </div>

      {/* Rating Metric Strip */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center gap-8">
        <div className="text-center sm:text-left flex items-center gap-4">
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {averageRating}
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} className="fill-amber-400" />
              ))}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Based on {reviews.length} customer reviews
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {['all', '5', '4', '3', '2', '1'].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                selectedRating === star
                  ? 'bg-[#002D62] text-white border-[#002D62]'
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50'
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

      {/* Review List */}
      {isLoading ? (
        <LoadingSpinner text="Loading customer reviews..." />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews found"
          description="There are currently no reviews matching this filter rating."
        />
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center font-bold text-xs">
                    {r.user?.name ? r.user.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {r.user?.name || 'Tourist Guest'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star size={14} className="fill-amber-400" />
                  <span>{r.rating || 5}.0</span>
                </div>
              </div>

              {r.title && (
                <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                  {r.title}
                </h4>
              )}

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {r.comment}
              </p>

              {/* Owner Reply if exists */}
              {(r.owner_reply || r.reply) && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs space-y-1">
                  <div className="font-bold text-[#002D62] dark:text-blue-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Official Response from {selectedBusiness.name}:</span>
                  </div>
                  <p className="text-slate-700 dark:text-zinc-300 pl-4">
                    {r.owner_reply || r.reply}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenReply(r)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Reply size={13} />
                  <span>{(r.owner_reply || r.reply) ? 'Update Reply' : 'Reply to Review'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official Reply to {replyingReview.user?.name || 'Customer'}
            </h3>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-xs text-slate-600 dark:text-zinc-300 italic">
              "{replyingReview.comment}"
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Your Response
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the guest for their visit and address any feedback..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="flex-1 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white text-xs font-bold"
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
