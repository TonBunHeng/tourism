import { useLanguage } from '../../i18n';

export default function DeletionHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6 md:mb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
          {t('deletion.title', 'Deletion Requests')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          {t('deletion.subtitle', 'Manage account deletion and item removal requests from users')}
        </p>
      </div>
    </div>
  );
}
