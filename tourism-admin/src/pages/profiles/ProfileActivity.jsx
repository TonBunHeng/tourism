import React from 'react';
import { Activity, Clock } from 'lucide-react';

export default function ProfileActivity({ recentActivity = [] }) {
  const safeActivities = (Array.isArray(recentActivity) ? recentActivity : []).slice(0, 5);

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <div>
          <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            Recent Activity
          </h3>
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Your recent administrative actions & logs
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {safeActivities.length > 0 ? (
          safeActivities.map((activity, index) => {
            const Icon = activity.icon || Activity;
            return (
              <div
                key={activity.id || index}
                className="flex items-center gap-3 p-2.5 rounded-md hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                    {activity.action}{' '}
                    {activity.target && (
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {activity.target}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {activity.time}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] py-4 text-center">
            No recent activities recorded.
          </p>
        )}
      </div>
    </div>
  );
}
