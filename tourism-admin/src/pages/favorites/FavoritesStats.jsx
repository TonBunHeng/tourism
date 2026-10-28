import React from 'react';
import { Heart, CheckCircle2, Star, Users } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function FavoritesStats({ favorites = [] }) {
  const { t } = useLanguage();
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const total = safeFavorites.length;
  const visited = safeFavorites.filter(f => Boolean(f.visited || f.status === 'Visited')).length;

  // Count unique users who favorited
  const uniqueUsers = new Set(
    safeFavorites.map(f => f.user?.id || f.user_id || f.user_name || f.user?.email).filter(Boolean)
  ).size;

  const avgRating = total > 0
    ? (safeFavorites.reduce((sum, f) => sum + (Number(f.rating || f.place?.rating) || 0), 0) / total).toFixed(1)
    : '0.0';

  const pct = total > 0 ? Math.round((visited / total) * 100) : 0;

  const stats = [
    {
      label: t('favorites.statTotalFavorites'),
      value: total.toLocaleString(),
      subtext: t('favorites.subtextTotalFavorites'),
      icon: Heart,
      color: 'text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)]',
      bg: 'bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)]'
    },
    {
      label: t('favorites.statActiveTravelers'),
      value: uniqueUsers > 0 ? uniqueUsers.toLocaleString() : total > 0 ? '1' : '0',
      subtext: t('favorites.subtextActiveTravelers'),
      icon: Users,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: t('favorites.statAvgRating'),
      value: `${avgRating} ★`,
      subtext: t('favorites.subtextAvgRating'),
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: t('favorites.statVisitedPlaces'),
      value: visited.toLocaleString(),
      subtext: t('favorites.subtextVisitedPlaces', { pct }),
      icon: CheckCircle2,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                  {stat.label}
                </p>
                <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
