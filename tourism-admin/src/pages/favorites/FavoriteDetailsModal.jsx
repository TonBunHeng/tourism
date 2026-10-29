import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Compass,
  CheckCircle2,
  Trash2,
  Check,
  Landmark,
  User,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { renderStars } from '../../utils/StatusUtils';
import { useLanguage } from '../../i18n';

export default function FavoriteDetailsModal({
  isOpen = false,
  onClose,
  favorite = null,
  onToggleVisited,
  onToggleStatus,
  onDelete
}) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen && favorite) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, favorite, onClose]);

  if (!isOpen || !favorite) return null;

  const IconComponent = favorite.icon || Landmark;
  const isVisited = Boolean(favorite.visited || favorite.status === 'Visited');
  const ratingVal = Number(favorite.rating ?? favorite.place?.rating ?? 0).toFixed(1);
  const reviewsCount = favorite.reviewsCount ?? favorite.reviews ?? favorite.place?.reviews_count ?? 0;
  const tagsList = Array.isArray(favorite.tags) ? favorite.tags : [];

  const userInfo = favorite.user || {};
  const userName = userInfo.name || favorite.user_name || t('favorites.anonymousTraveler');
  const userAvatar = userInfo.avatar || favorite.user_avatar || null;
  const userEmail = userInfo.email || favorite.user_email || 'user@angkorverses.com';
  const userPhone = userInfo.phone || 'Not provided';
  const userRole = userInfo.role || 'User';
  const userVerified = Boolean(userInfo.verified);
  const savedDate = favorite.saved_date || (favorite.created_at ? new Date(favorite.created_at).toLocaleDateString() : '');

  const handleToggle = (id) => {
    if (onToggleVisited) onToggleVisited(id);
    else if (onToggleStatus) onToggleStatus(id);
  };

  const handleDelete = (id) => {
    if (onDelete) onDelete(id);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] rounded-md max-w-2xl w-full max-h-[90vh] shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col animate-alert-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)] flex items-center justify-center border border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)]">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('favorites.modalTitle')}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('favorites.idLabel', { id: favorite.id })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] rounded-md transition-colors cursor-pointer"
            title={t('favorites.btnClose')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Hero Image / Banner */}
          <div className="relative h-56 w-full rounded-md overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            {favorite.image ? (
              <img
                src={favorite.image}
                alt={favorite.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800">
                <IconComponent className="w-16 h-16 text-[var(--color-primary)] opacity-40" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/60" />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-black/75 text-white border border-white/20">
                <IconComponent className="w-4 h-4" />
                <span>{favorite.category || 'Destination'}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border ${isVisited
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#003E83] text-white border-blue-800'
                  }`}
              >
                {isVisited ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('favorites.statusVisited')}
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> {t('favorites.statusToVisit')}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Place Title & Location */}
          <div>
            <h4 className="text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              {favorite.name}
            </h4>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-[var(--color-rose-badge-text)] shrink-0" />
              <span>{favorite.location || favorite.address || '—'}</span>
            </p>
          </div>

          {/* Favorited By (Traveler / User Info Section) */}
          <div className="p-4 rounded-md bg-[var(--color-info-bg)]/40 dark:bg-[var(--color-info-dark-bg)]/30 border border-[var(--color-info-border)]/50 dark:border-[var(--color-info-dark-border)]/50">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] flex items-center gap-1.5 mb-3">
              <User className="w-4 h-4" /> {t('favorites.labelSavedUser')}
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] flex items-center justify-center font-bold text-base shrink-0 border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {userName}
                    </p>
                    {userVerified && (
                      <span className="text-[10px] flex items-center gap-0.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] font-semibold bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] px-2 py-0.5 rounded-md border border-[var(--color-info-border)]">
                        <ShieldCheck className="w-3 h-3" /> Verified Traveler
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[var(--color-text-muted-light)]" />
                      {userEmail}
                    </span>
                    {userPhone !== 'Not provided' && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[var(--color-text-muted-light)]" />
                        {userPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] shrink-0">
                {savedDate && (
                  <span className="flex items-center gap-1 text-[var(--color-primary)] font-semibold">
                    <Calendar className="w-3.5 h-3.5" /> {t('favorites.savedDate', { date: savedDate })}
                  </span>
                )}
                <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                  Role: {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Key Place Attributes 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rating & Reviews */}
            <div className="p-3.5 rounded-md bg-[var(--color-surface-hover-light)]/60 dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">
                {t('favorites.labelRating')}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {renderStars(favorite.rating || favorite.place?.rating)}
                <span className="text-xs md:text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                  {ratingVal}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                {t('favorites.reviewsCount', { count: reviewsCount })}
              </p>
            </div>

            {/* Best Visiting Time */}
            <div className="p-3.5 rounded-md bg-[var(--color-surface-hover-light)]/60 dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">
                {t('favorites.labelBestTime')}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                <Clock className="w-4 h-4 text-[var(--color-info-text)] shrink-0" />
                <span className="truncate">{favorite.bestTime || favorite.best_time || '—'}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                {t('favorites.labelDuration')}: {favorite.duration || '—'}
              </p>
            </div>

            {/* Entry Price */}
            <div className="p-3.5 rounded-md bg-[var(--color-surface-hover-light)]/60 dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">
                {t('favorites.labelPrice')}
              </span>
              <div className="flex items-center gap-1 mt-1.5 text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                <DollarSign className="w-4 h-4 text-[var(--color-success-text)] shrink-0" />
                <span>{favorite.price || '—'}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                {t('favorites.labelOverview')}
              </p>
            </div>

            {/* Travel Wishlist Status */}
            <div className="p-3.5 rounded-md bg-[var(--color-surface-hover-light)]/60 dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">
                {t('favorites.labelStatus')}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                <Compass className="w-4 h-4 text-[var(--color-purple-badge-text)] shrink-0" />
                <span>{isVisited ? t('favorites.statusVisited') : t('favorites.statusToVisit')}</span>
              </div>
              {savedDate && (
                <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                  {t('favorites.savedDate', { date: savedDate })}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {favorite.description && (
            <div className="p-4 rounded-md bg-[var(--color-surface-hover-light)]/60 dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block mb-1.5">
                {t('favorites.labelNotes')}
              </span>
              <p className="text-xs md:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] leading-relaxed">
                {favorite.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {tagsList.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block mb-1.5">
                {t('favorites.labelTags')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tagsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[var(--color-neutral-badge-bg)] dark:bg-[var(--color-neutral-badge-dark-bg)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] rounded-md text-xs border border-[var(--color-neutral-badge-border)] dark:border-[var(--color-border-dark)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              handleDelete(favorite.id || favorite.place_id);
            }}
            className="py-2 px-4 rounded-md bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] hover:opacity-90 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] font-medium text-xs md:text-sm transition-colors flex items-center gap-1.5 border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)] cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('favorites.btnRemove')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleToggle(favorite.id);
              onClose();
            }}
            className="py-2 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-xs md:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isVisited ? <Clock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{isVisited ? t('favorites.btnMarkToVisit') : t('favorites.btnMarkVisited')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
