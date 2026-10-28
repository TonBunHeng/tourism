import { Plus } from "lucide-react";
import { useLanguage } from "../../i18n";

export default function UsersHeader({ onAddUser, onOpenAddModal }) {
  const { t } = useLanguage();
  const handleAdd = onAddUser || onOpenAddModal;

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            {t('users.title', 'Users')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            {t('users.subtitle', 'Manage and monitor all platform users')}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 flex-1 sm:flex-initial cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{t('users.addUserBtn', 'Add New User')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
