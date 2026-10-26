import { Award, Sparkles } from 'lucide-react';

export default function AchievementsHeader({ unlockedCount = 0, totalCount = 0 }) {
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Travel Milestones & Gamification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Explorer Badges & Rewards
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Unlock badges as you visit ancient temples, share authentic reviews, and complete travel itineraries
        </p>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto">
        <span className="px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-extrabold shadow-2xs border border-amber-200/60 dark:border-amber-800/60">
          {unlockedCount} / {totalCount} Badges Unlocked ({percentage}%)
        </span>
        <div className="w-36 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
