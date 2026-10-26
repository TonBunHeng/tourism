import { Check, Lock } from 'lucide-react';

export default function ProfileAchievements({ achievements = [] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 md:p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">Achievements</h3>
        <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium">
          {unlockedCount} of {achievements.length} Unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <div
              key={index}
              className={`text-center p-3 rounded-md transition-all relative flex flex-col justify-between h-[124px] ${
                achievement.unlocked
                  ? 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] border border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)] shadow-xs'
                  : 'bg-[var(--color-surface-hover-light)]/60 dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] opacity-60'
              }`}
            >
              <div>
                <div className="mb-1 flex justify-center">
                  <Icon
                    className={`w-6 h-6 ${
                      achievement.unlocked
                        ? 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]'
                        : 'text-gray-400 dark:text-zinc-500'
                    }`}
                  />
                </div>
                <p
                  className={`text-xs ${
                    achievement.unlocked
                      ? 'font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]'
                      : 'font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]'
                  }`}
                >
                  {achievement.name}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5 leading-tight line-clamp-2">
                  {achievement.description}
                </p>
              </div>
              <div className="mt-1.5 flex items-center justify-center">
                {achievement.unlocked ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]">
                    <Check className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-zinc-500">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
