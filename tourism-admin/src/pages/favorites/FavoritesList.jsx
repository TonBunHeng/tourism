import React from 'react';
import {
  MapPin,
  Star,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Landmark,
  Check,
  User
} from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function FavoritesList({
  favorites = [],
  selectedFavorites = [],
  setSelectedFavorites,
  onToggleSelect,
  onSelectAll,
  isAllSelected = false,
  onToggleVisited,
  onToggleStatus,
  onDelete,
  onViewDetails,
  onView,
  startIndex = 0
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

  const handleSelectOne = (id) => {
    if (onToggleSelect) {
      onToggleSelect(id);
    } else if (setSelectedFavorites) {
      setSelectedFavorites(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
  };

  const safeFavorites = favorites || [];

  return (
    <>
      {/* Mobile Card List View */}
      <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {safeFavorites.length > 0 ? (
          safeFavorites.map((favorite) => {
            const isVisited = Boolean(favorite.visited || favorite.status === 'Visited');
            const isSelected = selectedFavorites.includes(favorite.id);
            const userInfo = favorite.user || {};
            const userName = userInfo.name || favorite.user_name || t('favorites.anonymousTraveler');

            return (
              <div
                key={favorite.id}
                onClick={() => handleView(favorite)}
                className={`p-4 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-center">
                    {favorite.image ? (
                      <img
                        src={favorite.image}
                        alt={favorite.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Landmark className="w-5 h-5 text-[var(--color-primary)] opacity-50" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {favorite.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${isVisited
                          ? 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]'
                          : 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]'
                          }`}
                      >
                        {isVisited ? t('favorites.statusVisited') : t('favorites.statusToVisit')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)] border border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)]">
                        {favorite.category}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        {userName}
                      </span>
                    </div>

                    <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{favorite.location}</span>
                    </p>

                    <div
                      className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleVisit(favorite.id)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors cursor-pointer"
                        title={isVisited ? t('favorites.tooltipMarkToVisit') : t('favorites.tooltipMarkVisited')}
                      >
                        <Check className="w-4 h-4" />
                      </button>
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
          })
        ) : (
          <div className="text-center py-12 px-4">
            <Landmark className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
              {t('favorites.noFavoritesFound')}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('favorites.tryAdjustingFilter')}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Responsive Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-auto">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
            <tr>
              <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                {t('favorites.thIndex')}
              </th>
              <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('favorites.thPlaceAttraction')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-48">
                {t('favorites.thSavedBy')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
                {t('favorites.thRating')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                {t('favorites.thStatus')}
              </th>
              <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-24 whitespace-nowrap">
                {t('favorites.thActions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            {safeFavorites.length > 0 ? (
              safeFavorites.map((favorite, index) => {
                const IconComponent = favorite.icon || Landmark;
                const isVisited = Boolean(favorite.visited || favorite.status === 'Visited');
                const isSelected = selectedFavorites.includes(favorite.id);
                const ratingVal = Number(favorite.rating || favorite.place?.rating || 5.0).toFixed(1);
                const reviewsCount = favorite.reviewsCount ?? favorite.reviews ?? favorite.place?.reviews_count ?? 0;

                const userInfo = favorite.user || {};
                const userName = userInfo.name || favorite.user_name || t('favorites.anonymousTraveler');
                const userAvatar = userInfo.avatar || favorite.user_avatar || null;
                const userEmail = userInfo.email || favorite.user_email || 'user@angkorverses.com';
                const userVerified = Boolean(userInfo.verified);

                return (
                  <tr
                    key={favorite.id}
                    className={`hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group ${isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                  >
                    <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-center">
                          {favorite.image ? (
                            <img
                              src={favorite.image}
                              alt={favorite.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <IconComponent className="w-4 h-4 text-[var(--color-primary)] opacity-50" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            onClick={() => handleView(favorite)}
                            className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {favorite.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="px-2 py-0.2 text-[10px] font-semibold rounded-md bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)] border border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)]">
                              {favorite.category}
                            </span>
                            <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{favorite.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden">
                          {userAvatar ? (
                            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {userName}
                            </span>
                            {userVerified && (
                              <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 rounded-md">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate max-w-[140px]">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)] shrink-0" />
                        <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {ratingVal}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          ({reviewsCount})
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${isVisited
                          ? 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]'
                          : 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]'
                          }`}
                      >
                        {isVisited ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> {t('favorites.statusVisited')}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> {t('favorites.statusToVisit')}
                          </>
                        )}
                      </span>
                    </td>

                    <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleVisit(favorite.id)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors cursor-pointer"
                          title={isVisited ? t('favorites.tooltipMarkToVisit') : t('favorites.tooltipMarkVisited')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
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
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12 px-4">
                  <Landmark className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                    {t('favorites.noFavoritesFound')}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {t('favorites.tryAdjustingFilter')}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
