import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';

export default function RatingsHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            {t('ratings.title', 'Ratings & Reviews')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            {t('ratings.subtitle', 'Monitor tourist ratings, moderate traveler reviews, and analyze destination sentiment')}
          </p>
        </div>

        <Link
          to="/ratings/analytics"
          className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 w-full sm:w-auto cursor-pointer"
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>{t('ratings.analyticsBtn', 'Analytics')}</span>
        </Link>
      </div>
    </div>
  );
}
