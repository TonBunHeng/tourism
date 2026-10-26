import React from 'react';
import { ShieldCheck, Edit3, Building2, Activity } from 'lucide-react';

export default function TrackingStats({ meta = {}, stats = {} }) {
  const total = meta?.total_logs ?? stats?.total_actions ?? 0;
  const adminCount = meta?.admin_actions ?? stats?.roles_breakdown?.admin ?? 0;
  const editorCount = meta?.guide_editor_actions ?? stats?.roles_breakdown?.guide_editor ?? 0;
  const ownerCount = meta?.business_owner_actions ?? stats?.roles_breakdown?.business_owner ?? 0;

  const statCards = [
    {
      label: 'Total Operations',
      value: Number(total).toLocaleString(),
      subtext: 'Tracked staff & business actions',
      icon: Activity,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]',
    },
    {
      label: 'Admin Staff',
      value: Number(adminCount).toLocaleString(),
      subtext: 'Approvals, item edits & removals',
      icon: ShieldCheck,
      color: 'text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)]',
      bg: 'bg-[var(--color-purple-bg)] dark:bg-[var(--color-purple-dark-bg)]',
    },
    {
      label: 'Content Editors',
      value: Number(editorCount).toLocaleString(),
      subtext: 'Places, events & media modified',
      icon: Edit3,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]',
    },
    {
      label: 'Business Owners',
      value: Number(ownerCount).toLocaleString(),
      subtext: 'Profile edits & booking status',
      icon: Building2,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {statCards.map((stat, index) => {
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
            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2 truncate">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
