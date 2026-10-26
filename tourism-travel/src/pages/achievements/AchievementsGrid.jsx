import { Award, Lock, CheckCircle2, Sparkles } from 'lucide-react';

export default function AchievementsGrid({ achievements, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-44 bg-gray-200 dark:bg-zinc-800 rounded-3xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {achievements.map((item) => {
        const isUnlocked = Boolean(item.is_unlocked || item.unlocked_at);

        return (
          <div
            key={item.id}
            className={`modern-card p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
              isUnlocked
                ? 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg'
                : 'bg-gray-50/70 dark:bg-zinc-900/40 border-gray-200/70 dark:border-zinc-800/80 opacity-75'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUnlocked
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
                }`}
              >
                {isUnlocked ? <Award className="w-7 h-7" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                    {item.badge_name || item.name}
                  </h3>
                  {isUnlocked && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Unlocked</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {item.description || 'Milestone reward badge for tourism activities across Cambodia.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Explorer Reward
              </span>
              <span className="font-extrabold text-[#003E83] dark:text-blue-400">
                +{item.points || 50} Travel Pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
