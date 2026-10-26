import { Star, ThumbsUp, MessageSquare, ThumbsDown } from 'lucide-react';

export default function RatingsSentiment({ reviews = [], ratingDistribution, stats: statsOverview }) {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const total = statsOverview?.total_ratings ?? safeReviews.length;

  const distribution = ratingDistribution || [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: safeReviews.filter(rev => Number(rev.rating) === r).length
  }));

  const positiveCount = statsOverview?.positive_count ?? safeReviews.filter(r => Number(r.rating) >= 4).length;
  const neutralCount = safeReviews.filter(r => Number(r.rating) === 3).length;
  const negativeCount = statsOverview?.critical_count ?? safeReviews.filter(r => Number(r.rating) > 0 && Number(r.rating) <= 2).length;

  const positivePct = statsOverview?.positive_sentiment_pct !== undefined ? Math.round(statsOverview.positive_sentiment_pct) : (total > 0 ? Math.round((positiveCount / total) * 100) : 0);
  const neutralPct = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
  const negativePct = statsOverview?.critical_sentiment_pct !== undefined ? Math.round(statsOverview.critical_sentiment_pct) : (total > 0 ? Math.round((negativeCount / total) * 100) : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">Rating Distribution</h3>
          <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
            Based on {total.toLocaleString()} reviews
          </span>
        </div>
        <div className="space-y-3">
          {distribution.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.rating} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 w-10 sm:w-16 shrink-0">
                  <span className="text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{item.rating}</span>
                  <Star className="w-4 h-4 fill-[var(--color-warning-text)] text-[var(--color-warning-text)]" />
                </div>
                <div className="flex-1 h-2 bg-[var(--color-neutral-badge-bg)] dark:bg-[var(--color-surface-hover-dark)] rounded-md overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-warning-text)] rounded-md transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-16 sm:w-20 text-right shrink-0 flex items-center justify-end gap-1.5">
                  <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">{pct}%</span>
                  <span className="text-sm font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">({item.count})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-4">Overall Sentiment</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] rounded-md border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]">Positive (4-5★)</p>
                  <p className="text-[10px] text-[var(--color-success-text)]/80 dark:text-[var(--color-success-dark-text)]/80">{positiveCount} reviews</p>
                </div>
              </div>
              <span className="text-base font-bold text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]">
                {positivePct}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] rounded-md border border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]">Neutral (3★)</p>
                  <p className="text-[10px] text-[var(--color-warning-text)]/80 dark:text-[var(--color-warning-dark-text)]/80">{neutralCount} reviews</p>
                </div>
              </div>
              <span className="text-base font-bold text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]">
                {neutralPct}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] rounded-md border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)]">
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]">Negative (1-2★)</p>
                  <p className="text-[10px] text-[var(--color-danger-text)]/80 dark:text-[var(--color-danger-dark-text)]/80">{negativeCount} reviews</p>
                </div>
              </div>
              <span className="text-base font-bold text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]">
                {negativePct}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
