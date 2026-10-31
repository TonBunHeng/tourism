import { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Landmark, 
  Trees, 
  Compass, 
  MapPin 
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ICON_MAP = {
  Landmark: Landmark,
  Trees: Trees,
  Sparkles: Sparkles,
  Compass: Compass,
  Award: Award,
  MapPin: MapPin,
};

export default function Achievements() {
  const { isAuthenticated } = useAuth();
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchCall = isAuthenticated 
      ? travelService.getMyAchievements() 
      : travelService.getAchievements();

    fetchCall
      .then((res) => {
        if (res?.success) {
          const raw = res.data?.achievements || res.data || [];
          setBadges(Array.isArray(raw) ? raw : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load achievements:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  const unlockedCount = badges.filter((b) => b.unlocked || b.is_unlocked).length;
  const totalPoints = badges
    .filter((b) => b.unlocked || b.is_unlocked)
    .reduce((sum, b) => sum + (Number(b.points) || 50), 0);

  const percentage = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
          Traveler Gamification & Badges
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Cambodia Explorer Achievements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Earn official digital badges as you explore ancient Khmer temples, leave verified tips, and bookmark destinations.
        </p>
      </div>

      {/* Progress Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#002D62] to-[#001733] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
            Explorer Level
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            {unlockedCount >= 5 ? 'Cambodia Heritage Champion 🏆' : unlockedCount >= 3 ? 'Seasoned Explorer 🌟' : 'Aspiring Voyager 🧭'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-200">
            You have unlocked <strong className="text-white">{unlockedCount} of {badges.length}</strong> badges ({totalPoints} Adventure Points).
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-blue-200">
            <span>Overall Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      {isLoading ? (
        <LoadingSpinner text="Querying achievement records..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((b) => {
            const isUnlocked = Boolean(b.unlocked || b.is_unlocked);
            const name = b.name || b.badge_name || b.achievement_name;
            const Icon = ICON_MAP[b.icon] || Award;

            return (
              <div
                key={b.id || name}
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-900/60 shadow-md hover:shadow-xl'
                    : 'bg-slate-50/80 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 opacity-75'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isUnlocked 
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shadow-xs' 
                        : 'bg-slate-200 text-slate-400 dark:bg-zinc-800'
                    }`}>
                      <Icon size={24} />
                    </div>

                    {isUnlocked ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase flex items-center gap-1">
                        <Lock size={11} />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    +{b.points || 50} Points
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isUnlocked && b.unlocked_at
                      ? `Achieved ${new Date(b.unlocked_at).toLocaleDateString()}`
                      : isUnlocked ? 'Completed' : 'Requirement pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
