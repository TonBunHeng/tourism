import { MessageSquare, Star, ThumbsUp, Clock } from 'lucide-react';

export default function RatingsStats({ reviews = [], stats: statsOverview }) {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const total = statsOverview?.total_ratings ?? safeReviews.length;
  const avgRating = statsOverview?.avg_rating !== undefined ? Number(statsOverview.avg_rating).toFixed(1) : (total > 0
    ? (safeReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total).toFixed(1)
    : '0.0');
  const totalLikes = safeReviews.reduce((sum, r) => sum + (Number(r.likes) || 0), 0);
  const pending = safeReviews.filter(r => r.status === 'Pending').length;

  const stats = [
    {
      label: 'Total Reviews',
      value: total.toLocaleString(),
      subtext: 'Traveler reviews logged',
      icon: MessageSquare,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: 'Average Rating',
      value: `${avgRating} ★`,
      subtext: 'Destination score out of 5.0',
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: 'Total Likes',
      value: totalLikes.toLocaleString(),
      subtext: 'Community helpful votes',
      icon: ThumbsUp,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      label: 'Pending Reviews',
      value: pending.toLocaleString(),
      subtext: pending === 0 ? 'All reviews moderated' : `${pending} awaiting admin approval`,
      icon: Clock,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
