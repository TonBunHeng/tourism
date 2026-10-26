import { useState, useEffect } from 'react';
import { achievementService } from '../../services/achievementService';
import { useAuth } from '../../context/AuthContext';
import AchievementsHeader from './AchievementsHeader';
import AchievementsGrid from './AchievementsGrid';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function Achievements() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        if (isAuthenticated) {
          const res = await achievementService.getMyAchievements();
          if (res?.data) {
            setAchievements(res.data);
          }
        } else {
          const res = await achievementService.getAchievements();
          if (res?.data) {
            setAchievements(res.data.map((b) => ({ ...b, is_unlocked: false })));
          }
        }
      } catch (err) {
        console.error('Failed to load achievements', err);
      }
    };

    fetchBadges();
  }, [isAuthenticated]);

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Explorer Badges' }]} />
      <AchievementsHeader unlockedCount={unlockedCount} totalCount={achievements.length} />

      {!isAuthenticated && (
        <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[#003E83] dark:text-blue-300 font-semibold shadow-2xs">
          <span>Sign in to record your unlocked explorer achievements and progress tracking.</span>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            Sign In Now
          </button>
        </div>
      )}

      <AchievementsGrid achievements={achievements} />
    </div>
  );
}
