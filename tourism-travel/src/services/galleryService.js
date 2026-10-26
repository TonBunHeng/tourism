import api from './api';

const STORAGE_COMMENTS_KEY = 'angkor_gallery_comments';
const STORAGE_LIKES_PREFIX = 'angkor_gallery_likes';
const STORAGE_LIKE_COUNTS_KEY = 'angkor_gallery_like_counts';

function getCurrentUserKey() {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('travel_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id || u?.email) {
        return `user_${u.id || u.email}`;
      }
    }
  } catch {
    // fallback
  }
  return 'guest';
}

function getStoredLikes() {
  const userKey = getCurrentUserKey();
  try {
    const raw = localStorage.getItem(`${STORAGE_LIKES_PREFIX}_${userKey}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredLike(mediaId, isLiked) {
  const userKey = getCurrentUserKey();
  try {
    const likes = getStoredLikes();
    if (isLiked) {
      likes[String(mediaId)] = true;
    } else {
      delete likes[String(mediaId)];
    }
    localStorage.setItem(`${STORAGE_LIKES_PREFIX}_${userKey}`, JSON.stringify(likes));
  } catch (e) {
    console.error('Failed to set stored like', e);
  }
}

function getStoredLikeCounts() {
  try {
    const raw = localStorage.getItem(STORAGE_LIKE_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredLikeCount(mediaId, count) {
  try {
    const counts = getStoredLikeCounts();
    counts[String(mediaId)] = count;
    localStorage.setItem(STORAGE_LIKE_COUNTS_KEY, JSON.stringify(counts));
  } catch (e) {
    console.error('Failed to set stored like count', e);
  }
}

function getStoredComments(mediaId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_COMMENTS_KEY}_${mediaId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredComment(mediaId, newComment) {
  try {
    const existing = getStoredComments(mediaId);
    const filtered = existing.filter((c) => String(c.id) !== String(newComment.id));
    const updated = [newComment, ...filtered];
    localStorage.setItem(`${STORAGE_COMMENTS_KEY}_${mediaId}`, JSON.stringify(updated));
    return updated;
  } catch {
    return [newComment];
  }
}

export const galleryService = {
  isMediaLiked(mediaId, defaultLiked = false) {
    const likes = getStoredLikes();
    const idStr = String(mediaId);
    if (likes[idStr] !== undefined) {
      return Boolean(likes[idStr]);
    }
    return Boolean(defaultLiked);
  },

  getMediaLikesCount(mediaId, defaultCount = 0) {
    const counts = getStoredLikeCounts();
    const idStr = String(mediaId);
    if (counts[idStr] !== undefined) {
      return Number(counts[idStr]);
    }
    return Number(defaultCount);
  },

  async getGalleries(params = {}) {
    let list = [];
    try {
      const res = await api.get('/galleries', { params });
      const rawList = res?.data?.data || res?.data || res;
      if (Array.isArray(rawList)) {
        list = rawList;
      }
    } catch (err) {
      console.warn('Backend API galleries call failed', err);
    }

    // Enhance list with persisted user likes and accurate like counts
    const enhanced = list.map((item) => {
      const isLiked = this.isMediaLiked(item.id, item.is_liked || item.isLiked || false);
      const likesCount = this.getMediaLikesCount(
        item.id,
        item.likes_count ?? item.like_count ?? item.likes ?? 0
      );
      return {
        ...item,
        is_liked: isLiked,
        isLiked: isLiked,
        likes_count: likesCount,
      };
    });

    return { data: enhanced };
  },

  async getGalleryById(id) {
    try {
      const res = await api.get(`/galleries/${id}`);
      const itemData = res?.data?.data || res?.data || res;
      if (itemData) {
        const isLiked = this.isMediaLiked(itemData.id, itemData.is_liked || itemData.isLiked || false);
        const likesCount = this.getMediaLikesCount(
          itemData.id,
          itemData.likes_count ?? itemData.like_count ?? itemData.likes ?? 0
        );
        return {
          data: {
            ...itemData,
            is_liked: isLiked,
            isLiked: isLiked,
            likes_count: likesCount,
          },
        };
      }
    } catch (err) {
      console.warn(`Backend API getGalleryById(${id}) failed`, err);
    }

    return { data: null };
  },

  async getComments(mediaId) {
    let backendComments = [];
    try {
      const res = await api.get(`/galleries/${mediaId}/comments`);
      const list = res?.data?.data || res?.data;
      if (Array.isArray(list)) {
        backendComments = list;
      }
    } catch (err) {
      console.warn(`Backend API getComments(${mediaId}) failed`, err);
    }

    const stored = getStoredComments(mediaId);
    if (!stored || stored.length === 0) {
      return backendComments;
    }

    const existingIds = new Set(backendComments.map((c) => String(c.id)));
    const localOnly = stored.filter((c) => !existingIds.has(String(c.id)));
    return [...localOnly, ...backendComments];
  },

  async addComment(mediaId, commentData) {
    const payload = typeof commentData === 'string' 
      ? { comment: commentData }
      : {
          comment: commentData.comment || commentData.text || '',
          parent_id: commentData.parent_id || null,
        };

    let created = null;
    try {
      const res = await api.post(`/galleries/${mediaId}/comments`, payload);
      created = res?.data?.data || res?.data;
    } catch (err) {
      console.warn('Backend API addComment failed, saving locally', err);
    }

    let userName = commentData.user_name;
    let userAvatar = commentData.avatar;
    if (!userName) {
      try {
        const raw = localStorage.getItem('user') || localStorage.getItem('travel_user');
        if (raw) {
          const u = JSON.parse(raw);
          userName = u.name || u.username || (u.email ? u.email.split('@')[0] : 'Traveler');
          userAvatar = u.avatar || null;
        }
      } catch {
        userName = 'Traveler';
      }
    }

    const newComment = created || {
      id: `user-${Date.now()}`,
      user_name: userName || 'Traveler',
      user: { name: userName || 'Traveler', avatar: userAvatar },
      avatar: userAvatar,
      comment: payload.comment,
      parent_id: payload.parent_id,
      created_at: new Date().toISOString()
    };

    saveStoredComment(mediaId, newComment);
    return newComment;
  },

  async toggleLike(mediaId, currentItem = null) {
    const currentlyLiked = this.isMediaLiked(mediaId, currentItem?.is_liked || false);
    const newLiked = !currentlyLiked;

    const currentCount = this.getMediaLikesCount(
      mediaId,
      currentItem?.likes_count ?? currentItem?.like_count ?? currentItem?.likes ?? 0
    );
    const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    // Save immediately to localStorage
    setStoredLike(mediaId, newLiked);
    setStoredLikeCount(mediaId, newCount);

    // Dispatch global event so all components stay synced in real time
    window.dispatchEvent(
      new CustomEvent('angkor-gallery-like-changed', {
        detail: { mediaId: Number(mediaId), isLiked: newLiked, likesCount: newCount },
      })
    );

    // Try calling backend API
    try {
      const res = await api.post(`/galleries/${mediaId}/like`);
      const data = res?.data?.data || res?.data;
      if (data && (data.likes_count !== undefined || data.is_liked !== undefined)) {
        const confirmedLiked = Boolean(data.is_liked ?? newLiked);
        const confirmedCount = Number(data.likes_count ?? newCount);
        setStoredLike(mediaId, confirmedLiked);
        setStoredLikeCount(mediaId, confirmedCount);
        window.dispatchEvent(
          new CustomEvent('angkor-gallery-like-changed', {
            detail: { mediaId: Number(mediaId), isLiked: confirmedLiked, likesCount: confirmedCount },
          })
        );
        return { is_liked: confirmedLiked, likes_count: confirmedCount };
      }
    } catch (err) {
      console.warn(`Backend API toggleLike(${mediaId}) failed, retained persistent state`, err);
    }

    return { is_liked: newLiked, likes_count: newCount };
  },

  async recordView(mediaId) {
    try {
      const res = await api.post(`/galleries/${mediaId}/view`);
      const data = res?.data?.data || res?.data;
      if (data) {
        return data.views_count ?? data.view_count ?? data.views ?? null;
      }
    } catch (err) {
      console.warn(`Backend API recordView(${mediaId}) failed`, err);
    }
    return null;
  },

  subscribeToStream(mediaId, onUpdate) {
    try {
      const eventSource = new EventSource(`http://localhost:8000/api/travel/galleries/${mediaId}/stream`);
      eventSource.addEventListener('gallery_update', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (onUpdate) onUpdate(data);
        } catch (err) {
          console.error('Failed to parse SSE data', err);
        }
      });
      return eventSource;
    } catch (err) {
      console.warn('EventSource SSE subscription failed', err);
      return null;
    }
  }
};

export default galleryService;
