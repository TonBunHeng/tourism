import { FolderTree, Check, Layers, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function CategoriesStats({ categories = [] }) {
  const { t } = useLanguage();
  const safeCategories = Array.isArray(categories) ? categories : [];
  const totalCategories = safeCategories.length;
  const activeCategories = safeCategories.filter(c => c.status === "Active").length;
  const totalPlaces = safeCategories.reduce((sum, c) => sum + (Number(c.placeCount || c.places_count) || 0), 0);
  const avgPlaces = totalCategories > 0 ? Math.round(totalPlaces / totalCategories) : 0;
  const activePercent = totalCategories > 0 ? Math.round((activeCategories / totalCategories) * 100) : 0;

  const stats = [
    {
      label: t('categories.statTotalCategories', 'Total Categories'),
      value: totalCategories.toLocaleString(),
      subtext: t('categories.statTotalSubtext', 'Organized destination groups'),
      icon: FolderTree,
      color: "text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]",
      bg: "bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]"
    },
    {
      label: t('categories.statActiveCategories', 'Active Categories'),
      value: activeCategories.toLocaleString(),
      subtext: t('categories.statActiveSubtext', '{percent}% available in app').replace('{percent}', activePercent),
      icon: Check,
      color: "text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]",
      bg: "bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]"
    },
    {
      label: t('categories.statTotalPlaces', 'Total Places'),
      value: totalPlaces.toLocaleString(),
      subtext: t('categories.statTotalPlacesSubtext', 'Assigned attraction records'),
      icon: Layers,
      color: "text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]",
      bg: "bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]"
    },
    {
      label: t('categories.statAvgPlaces', 'Avg Places / Category'),
      value: avgPlaces.toLocaleString(),
      subtext: t('categories.statAvgPlacesSubtext', 'Average density per type'),
      icon: TrendingUp,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
      {stats.map((stat, index) => {
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
            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
