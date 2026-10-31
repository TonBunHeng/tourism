import React from 'react';
import { Star, Video, Image } from 'lucide-react';

export const getStatusColor = (status) => {
  const norm = String(status || '').toLowerCase().trim();
  if (norm === 'active' || norm === 'approved' || norm === 'completed') {
    return 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]';
  }
  if (norm === 'pending' || norm === 'scheduled' || norm === 'upcoming') {
    return 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]';
  }
  if (norm === 'inactive' || norm === 'rejected' || norm === 'suspended' || norm === 'cancelled' || norm === 'flagged') {
    return 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]';
  }
  return 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]';
};

export const calculateAutoStatus = (startDate, endDate, manualStatus) => {
  if (manualStatus === 'Cancelled') return 'Cancelled';
  if (!startDate) return 'Upcoming';

  const todayStr = new Date().toISOString().split('T')[0];
  const start = String(startDate).slice(0, 10);
  const end = endDate ? String(endDate).slice(0, 10) : start;

  if (todayStr < start) {
    return 'Upcoming';
  } else if (todayStr > end) {
    return 'Completed';
  } else {
    return 'Ongoing';
  }
};

export const getEventStatusColor = (status) => {
  const colors = {
    'Upcoming': 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] dark:bg-[var(--color-info-dark-bg)] dark:text-[var(--color-info-dark-text)] dark:border-[var(--color-info-dark-border)]',
    'Ongoing': 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]',
    'Completed': 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]',
    'Cancelled': 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]'
  };
  return colors[status] || colors['Upcoming'];
};

export const getTypeBadgeColor = (type) => {
  const colors = {
    'Capital City': 'bg-[var(--color-purple-badge-bg)] text-[var(--color-purple-badge-text)] border-[var(--color-purple-badge-border)] dark:bg-[var(--color-purple-badge-dark-bg)] dark:text-[var(--color-purple-badge-dark-text)] dark:border-[var(--color-purple-badge-dark-border)]',
    'Province': 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] dark:bg-[var(--color-info-dark-bg)] dark:text-[var(--color-info-dark-text)] dark:border-[var(--color-info-dark-border)]',
    'Municipality': 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]'
  };
  return colors[type] || 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]';
};

export const getCategoryColor = (category) => {
  const colors = {
    'Sports': 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] dark:bg-[var(--color-info-dark-bg)] dark:text-[var(--color-info-dark-text)] dark:border-[var(--color-info-dark-border)]',
    'Cultural': 'bg-[var(--color-purple-badge-bg)] text-[var(--color-purple-badge-text)] border-[var(--color-purple-badge-border)] dark:bg-[var(--color-purple-badge-dark-bg)] dark:text-[var(--color-purple-badge-dark-text)] dark:border-[var(--color-purple-badge-dark-border)]',
    'Arts & Entertainment': 'bg-[var(--color-rose-badge-bg)] text-[var(--color-rose-badge-text)] border-[var(--color-rose-badge-border)] dark:bg-[var(--color-rose-badge-dark-bg)] dark:text-[var(--color-rose-badge-dark-text)] dark:border-[var(--color-rose-badge-dark-border)]',
    'Food & Drink': 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]',
    'Music': 'bg-[var(--color-rose-badge-bg)] text-[var(--color-rose-badge-text)] border-[var(--color-rose-badge-border)] dark:bg-[var(--color-rose-badge-dark-bg)] dark:text-[var(--color-rose-badge-dark-text)] dark:border-[var(--color-rose-badge-dark-border)]'
  };
  return colors[category] || 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]';
};

export const getChatStatusColor = (status) => {
  const colors = {
    online: 'bg-emerald-500',
    away: 'bg-[var(--color-warning-text)]',
    offline: 'bg-[var(--color-text-muted-light)]'
  };
  return colors[status] || colors.offline;
};

export const getPriorityBadge = (priority) => {
  const colors = {
    critical: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)]',
    high: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]',
    medium: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]',
    low: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)]'
  };
  return colors[priority] || colors.low;
};

export const renderStars = (rating, size = 'sm') => {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return React.createElement(
    'div',
    { className: 'flex gap-0.5' },
    [...Array(5)].map((_, i) =>
      React.createElement(Star, {
        key: i,
        className: `${i < rating ? 'fill-[var(--color-warning-text)] text-[var(--color-warning-text)]' : 'text-[var(--color-border-subtle-light)] dark:text-[var(--color-border-dark)]'} ${starSize}`
      })
    )
  );
};

export const getUserStatusColor = (status, isOnline = false) => {
  const norm = String(status || '').toLowerCase().trim();
  if (norm === 'suspended') {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
  }
  if ((norm === 'active' || norm === 'online') && isOnline) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  }
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
};

export const formatRoleLabel = (role) => {
  if (!role) return 'User';
  const norm = String(role).toLowerCase().trim().replace(/[_\-\s]+/g, '_');
  const roleMap = {
    'business_owner': 'Business Owner',
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'tourism_content_editor': 'Tourism Content Editor',
    'guide_editor': 'Tourism Content Editor',
    'guide': 'Tourism Content Editor',
    'editor': 'Editor',
    'user': 'User'
  };
  if (roleMap[norm]) return roleMap[norm];

  return String(role)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

export const getRoleColor = (role) => {
  const norm = String(role || '').toLowerCase().trim().replace(/[_\-\s]+/g, '_');

  if (norm === 'admin') {
    return 'bg-[var(--color-purple-bg)] text-[var(--color-purple-text)] border-[var(--color-purple-border)] dark:bg-[var(--color-purple-dark-bg)] dark:text-[var(--color-purple-dark-text)] dark:border-[var(--color-purple-dark-border)]';
  }
  if (norm === 'super_admin') {
    return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
  }
  if (norm === 'business_owner') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  }
  if (norm === 'guide_editor' || norm === 'guide' || norm === 'editor' || norm === 'tourism_content_editor') {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
  }
  return 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-neutral-badge-border)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-neutral-badge-dark-border)]';
};

export const getSubscriptionColor = (subscription) => {
  const colors = {
    'Premium': 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]',
    'Basic': 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] dark:bg-[var(--color-info-dark-bg)] dark:text-[var(--color-info-dark-text)] dark:border-[var(--color-info-dark-border)]',
    'Free': 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-neutral-badge-border)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-neutral-badge-dark-border)]'
  };
  return colors[subscription] || colors['Free'];
};

export const getGalleryStatusColor = (status) => {
  return status === 'Published'
    ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]'
    : 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]';
};

export const getTypeIcon = (type) => {
  return type === 'video' ? Video : Image;
};

export const getReviewStatusColor = (status) => {
  const colors = {
    'Published': 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]',
    'Pending': 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]',
    'Flagged': 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]',
    'Archived': 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-neutral-badge-border)] dark:bg-[var(--color-surface-hover-dark)]/50 dark:text-[var(--color-text-secondary-dark)] dark:border-[var(--color-border-dark)]'
  };
  return colors[status] || colors['Pending'];
};

export const getTypeLabel = (type) => {
  return type === 'account' ? 'Account Deletion' : 'Item Deletion';
};

export const getBusinessVerificationStatusColor = (status) => {
  const norm = String(status || '').toLowerCase().trim();
  if (norm === 'approved') {
    return 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]';
  }
  if (norm === 'pending') {
    return 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] dark:bg-[var(--color-info-dark-bg)] dark:text-[var(--color-info-dark-text)] dark:border-[var(--color-info-dark-border)]';
  }
  if (norm === 'suspended') {
    return 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]';
  }
  if (norm === 'rejected') {
    return 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]';
  }
  return 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]';
};

