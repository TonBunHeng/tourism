import { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Eye,
  MessageSquare,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Send,
  Lock,
  CornerDownRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { galleryService } from '../../services/galleryService';
import { useTravel } from '../../context/TravelContext';
import { useAuth } from '../../context/AuthContext';

const isVideoItem = (item) => {
  if (!item) return false;
  const mediaType = (item.media_type || item.type || '').toLowerCase();
  if (mediaType === 'video') return true;
  const url = item.media_url || item.url || item.thumbnail_url || '';
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
};

export default function MediaLightboxModal({ isOpen, item, onClose, onNavigate, items = [] }) {
  const { showToast } = useTravel();
  const { isAuthenticated, openAuthModal, user } = useAuth();

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);

  const commentsEndRef = useRef(null);

  if (isOpen && item && item.id !== activeItemId) {
    setActiveItemId(item.id);
    setIsLiked(galleryService.isMediaLiked(item.id, item.is_liked || item.isLiked || item.liked));
    setLikesCount(galleryService.getMediaLikesCount(item.id, item.likes_count ?? item.like_count ?? item.likes ?? 0));
    setViewsCount(item.views_count ?? item.view_count ?? item.views ?? 0);
  }

  useEffect(() => {
    const handleLikeChanged = (e) => {
      if (item && e.detail && String(e.detail.mediaId) === String(item.id)) {
        setIsLiked(e.detail.isLiked);
        setLikesCount(e.detail.likesCount);
      }
    };
    window.addEventListener('angkor-gallery-like-changed', handleLikeChanged);
    return () => window.removeEventListener('angkor-gallery-like-changed', handleLikeChanged);
  }, [item]);

  useEffect(() => {
    if (isOpen && item) {
      galleryService.recordView(item.id).then((newViews) => {
        if (newViews !== null) setViewsCount(newViews);
      });

      galleryService.getComments(item.id).then((initialComments) => {
        setComments(Array.isArray(initialComments) ? initialComments : []);
      });

      const eventSource = galleryService.subscribeToStream(item.id, (event) => {
        if (event.type === 'comment' && event.comment) {
          setComments((prev) => {
            const commentsList = Array.isArray(prev) ? prev : [];
            if (commentsList.some((c) => c.id === event.comment.id)) return commentsList;
            return [...commentsList, event.comment];
          });
        }
      });

      return () => {
        if (eventSource && typeof eventSource.close === 'function') {
          eventSource.close();
        }
      };
    }
  }, [isOpen, item]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNavigate) onNavigate('next');
      if (e.key === 'ArrowLeft' && onNavigate) onNavigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen || !item) return null;

  const isVideo = isVideoItem(item);
  const mediaUrl = item.media_url || item.url || '';
  const currentIndex = items.findIndex((i) => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const requireAuth = (actionName = 'perform this action') => {
    if (!isAuthenticated) {
      showToast(`Please log in to ${actionName}.`, 'info');
      if (openAuthModal) openAuthModal('login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth('like photos and videos')) return;

    try {
      const res = await galleryService.toggleLike(item.id, {
        is_liked: isLiked,
        likes_count: likesCount,
      });
      if (res) {
        setIsLiked(Boolean(res.is_liked ?? res.isLiked ?? res.liked));
        setLikesCount(res.likes_count ?? res.like_count ?? res.likes ?? likesCount);
        showToast(res.is_liked ? 'Liked media!' : 'Unliked media', 'success');
      }
    } catch {
      showToast('Failed to toggle like', 'error');
    }
  };

  const handleReplyClick = (commentItem) => {
    if (!requireAuth('reply to comments')) return;
    setReplyingTo(commentItem);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!requireAuth('post comments')) return;
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        comment: commentText.trim(),
        parent_id: replyingTo ? replyingTo.id : null,
        user_name: user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'Traveler'),
        avatar: user?.avatar || null,
      };

      const newComment = await galleryService.addComment(item.id, payload);
      if (newComment) {
        if (!replyingTo) {
          setComments((prev) => [newComment, ...(Array.isArray(prev) ? prev : [])]);
        } else {
          setComments((prev) =>
            (Array.isArray(prev) ? prev : []).map((c) => {
              if (c.id === replyingTo.id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment],
                };
              }
              return c;
            })
          );
        }

        setCommentText('');
        setReplyingTo(null);
        showToast('Comment posted successfully!', 'success');
      }
    } catch {
      showToast('Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: item.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = item.title || 'media';
    a.target = '_blank';
    a.click();
    showToast('Download started', 'info');
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors cursor-pointer border border-zinc-700"
        title="Close Lightbox (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-zinc-800">
        {/* Left Side: Media Player / Viewer */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] md:min-h-[480px] select-none">
          {isVideo ? (
            <video src={mediaUrl} controls autoPlay className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain" />
          ) : (
            <img src={mediaUrl} alt={item.title} className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain" />
          )}

          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('prev')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer border border-white/20"
              title="Previous item"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('next')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer border border-white/20"
              title="Next item"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Media Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 text-[11px] font-semibold text-white border border-white/20">
            {item.category || item.tag || 'Gallery'}
          </div>
        </div>

        {/* Right Side: Details & Comments Panel */}
        <div className="w-full md:w-96 flex flex-col justify-between p-4 md:p-5 bg-gray-50 dark:bg-zinc-900 border-t md:border-t-0 md:border-l border-gray-200 dark:border-zinc-800 overflow-y-auto">
          {/* Header Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 leading-snug">{item.title}</h3>
              {item.place && (
                <p className="text-xs text-[#003E83] dark:text-[#60a5fa] font-semibold mt-0.5">{item.place}</p>
              )}
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center justify-between py-2.5 px-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                  }`}
                  title={isAuthenticated ? "Toggle Like" : "Login required to like"}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{likesCount}</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-zinc-400">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>{viewsCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 rounded-full bg-gray-200/80 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-full bg-gray-200/80 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {item.place_id && (
                <Link
                  to={`/places/${item.place_id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 font-semibold text-[#003E83] dark:text-blue-400 hover:underline text-xs"
                >
                  <span>Destination</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-zinc-200">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Comments ({safeComments.length})</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● Real-time Live</span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {safeComments.length > 0 ? (
                  safeComments.map((c, cIdx) => (
                    <div key={c.id || `comment-${cIdx}`} className="p-2.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/50 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.user_name || c.author || 'User'} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#003E83] text-white text-[10px] font-bold flex items-center justify-center">
                              {(c.user_name || c.author || 'T').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                            {c.user_name || c.author || c.author_name || 'Traveler'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-400">{c.date || formatCommentDate(c.created_at)}</span>
                      </div>

                      <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed pl-6.5">
                        {c.comment || c.text || c.content}
                      </p>

                      <div className="pl-6.5 pt-0.5 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleReplyClick(c)}
                          className="text-[#003E83] dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {Array.isArray(c.replies) && c.replies.length > 0 && (
                        <div className="ml-5 mt-2 space-y-1.5 border-l-2 border-blue-200 dark:border-zinc-700 pl-2.5">
                          {c.replies.map((reply) => (
                            <div key={reply.id || `reply-${Math.random()}`} className="p-2 rounded-md bg-gray-50 dark:bg-zinc-900/80 border border-gray-200/60 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                                  {reply.user_name || reply.author || 'Traveler'}
                                </span>
                                <span className="text-[9px] text-gray-400">{reply.date || formatCommentDate(reply.created_at)}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 dark:text-zinc-300">
                                {reply.comment || reply.text || reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium py-4 text-center bg-gray-100/70 dark:bg-zinc-800/30 rounded-lg border border-gray-200/80 dark:border-zinc-800/60">
                    No comments yet. Be the first to leave a comment!
                  </p>
                )}
                <div ref={commentsEndRef} />
              </div>
            </div>
          </div>

          {/* Comment & Reply Input Box */}
          <form onSubmit={handleCommentSubmit} className="pt-2 border-t border-gray-200 dark:border-zinc-800 space-y-1">
            {replyingTo && (
              <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-900">
                <span>Replying to <strong>{replyingTo.user_name || replyingTo.author || 'comment'}</strong></span>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={
                  isAuthenticated
                    ? replyingTo
                      ? "Write a reply..."
                      : "Write a comment..."
                    : "Login required to comment & like..."
                }
                value={commentText}
                onFocus={() => {
                  if (!isAuthenticated) requireAuth('comment on photos and videos');
                }}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-xs bg-white dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#003E83] dark:focus:ring-blue-400 focus:border-[#003E83] dark:focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="absolute right-1.5 p-1.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                title={isAuthenticated ? "Post comment" : "Login required"}
              >
                {isAuthenticated ? <Send className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-300" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
