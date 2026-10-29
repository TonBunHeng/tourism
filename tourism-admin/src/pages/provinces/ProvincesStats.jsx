import React from 'react';
import { Globe, Check, Users, Building2 } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function ProvincesStats({ provinces = [], totalRecords }) {
  const { t } = useLanguage();
  const safeProvinces = Array.isArray(provinces) ? provinces : [];
  const total = Number.isFinite(Number(totalRecords)) ? Number(totalRecords) : safeProvinces.length;
  const activeCount = safeProvinces.filter(p => String(p.status || '').toLowerCase() === 'active').length;
  const totalPopulation = safeProvinces.reduce((sum, p) => {
    const population = Number(String(p.population ?? '').replaceAll(',', '').trim());
    return sum + (Number.isFinite(population) ? population : 0);
  }, 0);
  const totalPlaces = safeProvinces.reduce((sum, p) => sum + (Number(p.places) || 0), 0);

  const activePct = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  const stats = [
    { 
      label: t('provinces.statTotalProvinces', 'Total Provinces'),
      value: total.toLocaleString(),
      subtext: t('provinces.subtextTotalProvinces', 'Official regions across Cambodia'),
      icon: Globe, 
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    { 
      label: t('provinces.statActiveRegionsPage', 'Active on This Page'),
      value: activeCount.toLocaleString(),
      subtext: t('provinces.subtextActiveRegionsPage', '{pct}% of loaded regions').replace('{pct}', activePct),
      icon: Check, 
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    { 
      label: t('provinces.statPopulationOnPage', 'Population on This Page'),
      value: totalPopulation > 0 ? totalPopulation.toLocaleString() : '—',
      subtext: t('provinces.subtextPopulationOnPage', 'Population recorded for loaded regions'),
      icon: Users, 
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    },
    { 
      label: t('provinces.statPlacesOnPage', 'Places on This Page'),
      value: totalPlaces > 0 ? totalPlaces.toLocaleString() : '—',
      subtext: t('provinces.subtextTotalPlaces', 'Mapped regional attractions'),
      icon: Building2, 
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
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
