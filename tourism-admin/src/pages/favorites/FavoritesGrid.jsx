import React from 'react';
import {
  MapPin,
  Star,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Heart,
  Landmark,
  Check,
  DollarSign,
  Compass,
  User,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function FavoritesGrid({
  favorites = [],
  selectedFavorites = [],
  setSelectedFavorites,
  onToggleSelect,
  onToggleVisited,
  onToggleStatus,
  onDelete,
  onViewDetails,
  onView
}) {
  const { t } = useLanguage();

  const handleToggleVisit = (id) => {
    if (onToggleVisited) onToggleVisited(id);
    else if (onToggleStatus) onToggleStatus(id);
  };

  const handleView = (favorite) => {
    if (onView) onView(favorite);
    else if (onViewDetails) onViewDetails(favorite);
  };

  const handleDelete = (id) => {
    if (onDelete) onDelete(id);
  };

  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-md bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)] flex items-center justify-center mb-4 border border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)]">
          <Landmark className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
          {t('favorites.noFavoritesFound')}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] max-w-md">
          {t('favorites.tryAdjustingFilter')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-6">
      {favorites.map((favorite) => {
        const IconComponent = favorite.icon || Landmark;
        const isVisited = Boolean(favorite.visited || favorite.status === 'Visited');
        const isSelected = selectedFavorites.includes(favorite.id);
        const ratingVal = Number(favorite.rating || favorite.place?.rating || 5.0).toFixed(1);
        const reviewsCount = favorite.reviewsCount ?? favorite.reviews ?? favorite.place?.reviews_count ?? 0;

        const userInfo = favorite.user || {};
        const userName = userInfo.name || favorite.user_name || t('favorites.anonymousTraveler');
        const userAvatar = userInfo.avatar || favorite.user_avatar || null;
        const savedDate = favorite.saved_date || (favorite.created_at ? t('favorites.savedDate', { date: new Date(favorite.created_at).toLocaleDateString() }) : '');

        return (
          <div
            key={favorite.id}
            className={`bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md overflow-hidden shadow-xs flex flex-col justify-between group ${isSelected ? 'ring-2 ring-[var(--color-primary)]' : ''
              }`}
          >
            {/* Image & Badges */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
              {favorite.image ? (
                <img
                  src={favorite.image}
                  alt={favorite.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800">
                  <IconComponent className="w-12 h-12 text-[#003E83] dark:text-blue-400 opacity-40" />
                </div>
              )}

              {/* Dark overlay for contrast */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Heart Badge (Top Right) */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={() => handleDelete(favorite.id || favorite.place_id)}
                  title={t('favorites.tooltipDelete')}
                  className="p-1.5 rounded-md bg-white/90 dark:bg-zinc-900/90 text-rose-600 hover:bg-white transition-colors shadow-xs cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current text-rose-600" />
                </button>
              </div>

              {/* Category & Status Badges */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-black/75 text-white border border-white/20">
                  <IconComponent className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[110px]">{favorite.category || 'Destination'}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border ${isVisited
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

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3
                  onClick={() => handleView(favorite)}
                  className="font-bold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-info-dark-text)] transition-colors cursor-pointer line-clamp-1"
                >
                  {favorite.name}
                </h3>

                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-rose-badge-text)] shrink-0" />
                  <span className="truncate">{favorite.location || 'Cambodia'}</span>
                </p>

                {/* Traveler / User Info Highlight */}
                <div className="flex items-center gap-2 mt-3 p-2 bg-[var(--color-surface-hover-light)]/70 dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                  <div className="w-7 h-7 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                      {userName}
                    </p>
                    {savedDate && (
                      <p className="text-[10px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> {savedDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Place details grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                    <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)] shrink-0" />
                    <span className="font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {ratingVal}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted-light)] truncate">({reviewsCount})</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                    <DollarSign className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-muted-light)]" />
                    <span className="truncate">{favorite.price || 'Free'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-muted-light)]" />
                    <span className="truncate">{favorite.bestTime || 'Morning'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                    <Compass className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-muted-light)]" />
                    <span className="truncate">{favorite.duration || '2-3 Hours'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <button
                  type="button"
                  onClick={() => handleToggleVisit(favorite.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${isVisited
                    ? 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)] hover:opacity-85'
                    : 'bg-[var(--color-neutral-badge-bg)] dark:bg-[var(--color-neutral-badge-dark-bg)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:text-[var(--color-primary)]'
                    }`}
                  title={isVisited ? t('favorites.tooltipMarkToVisit') : t('favorites.tooltipMarkVisited')}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isVisited ? t('favorites.statusVisited') : t('favorites.tooltipMarkVisited')}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleView(favorite)}
                    className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title={t('favorites.tooltipViewDetails')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(favorite.id || favorite.place_id)}
                    className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title={t('favorites.tooltipDelete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
