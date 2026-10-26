import { useState, useEffect, useCallback } from 'react';
import { Star, Loader2, MessageSquare, Send } from 'lucide-react';
import guideService from '../../services/guideService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuideReviews() {
  const { showAlert } = useAlert();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await guideService.getReviews();
      const list = res?.data?.reviews || res?.data || res || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const handleReplySubmit = async (id) => {
    const text = replyText[id]?.trim();
    if (!text) return;

    setSubmittingId(id);
    try {
      await guideService.replyReview(id, text);
      setReplyText(prev => ({ ...prev, [id]: '' }));
      showAlert({ title: 'Success', message: 'Official guide response posted.', type: 'success' });
      fetchReviews();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to post reply.', type: 'danger' });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Guide Portal', to: '/guide/dashboard' },
          { label: 'Review Moderation' }
        ]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Community Reviews Feed
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Provide official guide clarifications, tourist assistance notes, and heritage information responses.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading traveler reviews...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 shadow-xs transition-colors">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
            Tourist Reviews & Feedback ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-400 dark:text-zinc-500 mx-auto" />
              <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">No traveler reviews found.</p>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">Tourist reviews submitted for places and destinations will appear here.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-gray-200 dark:border-zinc-700/60 space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 dark:text-white">
                    {r.user?.name || r.author_name || 'Tourist'}
                  </span>
                  <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{r.rating ? `${r.rating}.0` : '5.0'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
                  {r.comment || r.content || 'Great experience exploring heritage sites in Cambodia!'}
                </p>

                {/* Existing Replies */}
                {r.replies && r.replies.length > 0 && r.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-md text-xs space-y-1"
                  >
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">
                      Guide Response{reply.user?.name ? ` (${reply.user.name})` : ''}:
                    </span>
                    <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed">{reply.reply || reply.content}</p>
                  </div>
                ))}

                {/* Reply Input Form */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Write official guide assistance note..."
                    value={replyText[r.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                  />
                  <button
                    onClick={() => handleReplySubmit(r.id)}
                    disabled={submittingId === r.id || !replyText[r.id]?.trim()}
                    className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {submittingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
