import React from 'react';
import { Landmark, MessageSquare, Image, User, Calendar, Bell, Clock, ArrowRight, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentActivity({ activities, recentPlaces }) {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'place':
        return Landmark;
      case 'booking':
        return CalendarCheck;
      case 'review':
        return MessageSquare;
      case 'gallery':
        return Image;
      case 'user':
        return User;
      case 'event':
        return Calendar;
      default:
        return Bell;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40';
      case 'place':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40';
      case 'review':
        return 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]';
      case 'gallery':
        return 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)]';
      case 'user':
        return 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)] text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] border-[var(--color-purple-badge-border)] dark:border-[var(--color-purple-badge-dark-border)]';
      case 'event':
        return 'bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)] border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)]';
      default:
        return 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  const defaultActivities = [
    { id: 1, user: 'Admin System', type: 'place', action: 'Published new destination', target: 'Angkor Wat Complex', time: '5m ago' },
    { id: 2, user: 'Sarah Jenkins', type: 'review', action: 'Submitted 5-star review for', target: 'Bayon Temple', time: '22m ago' },
    { id: 3, user: 'David Kim', type: 'user', action: 'Registered verified traveler profile', target: '', time: '1h ago' },
    { id: 4, user: 'Media Hub', type: 'gallery', action: 'Uploaded high-res gallery for', target: 'Ta Prohm', time: '3h ago' },
    { id: 5, user: 'Events Team', type: 'event', action: 'Scheduled cultural festival', target: 'Water Festival 2026', time: '5h ago' }
  ];

  const list = (Array.isArray(activities) && activities.length > 0
    ? activities
    : (Array.isArray(recentPlaces) && recentPlaces.length > 0
        ? recentPlaces.map(rp => ({
            id: rp.id,
            user: 'Admin',
            type: 'place',
            action: 'Added new place',
            target: rp.name,
            time: 'Recently'
          }))
        : defaultActivities)).slice(0, 5);

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <div>
          <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            Recent Activity
          </h3>
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Latest platform events & updates
          </p>
        </div>
        <button
          onClick={() => navigate('/notifications')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {list.length > 0 ? (
          list.map((activity, idx) => {
            const Icon = getIcon(activity.type);
            return (
              <div
                key={activity.id || idx}
                className="flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                      {activity.user}
                    </p>
                    <span className={`text-[10px] px-2 py-0.2 rounded-md font-semibold uppercase tracking-wider border shrink-0 ${getBadgeStyle(activity.type)}`}>
                      {activity.type}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] line-clamp-1 mt-0.5">
                    {activity.action}{' '}
                    {activity.target && (
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {activity.target}
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-mono mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
