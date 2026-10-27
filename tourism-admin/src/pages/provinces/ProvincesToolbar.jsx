import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function ProvincesToolbar({
  selectedType = 'All',
  onTypeChange = () => {},
  selectedStatus = 'All',
  onStatusChange = () => {},
  provinceTypes = ['All', 'Capital City', 'Province', 'Municipality'],
  totalCount
}) {
  const { t } = useLanguage();
  const typesList = Array.isArray(provinceTypes) ? provinceTypes : ['All', 'Capital City', 'Province', 'Municipality'];
  const statusList = ['All', 'Active', 'Inactive'];

  const getTypeOptionLabel = (type) => {
    switch (type) {
      case 'All': return t('provinces.typeAll', 'All Types');
      case 'Capital City': return t('provinces.typeCapitalCity', 'Capital City');
      case 'Province': return t('provinces.typeProvince', 'Province');
      case 'Municipality': return t('provinces.typeMunicipality', 'Municipality');
      default: return type;
    }
  };

  const getStatusOptionLabel = (status) => {
    switch (status) {
      case 'All': return t('provinces.statusAll', 'All Statuses');
      case 'Active': return t('provinces.statusActive', 'Active');
      case 'Inactive': return t('provinces.statusInactive', 'Inactive');
      default: return status;
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {t('provinces.allRegionsHeading', 'All Regions')}
          </h2>
          {totalCount !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {totalCount} {totalCount === 1 ? t('provinces.regionBadgeSingular', 'region') : t('provinces.regionBadgePlural', 'regions')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {typesList.map(type => (
                <option key={type} value={type}>{getTypeOptionLabel(type)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {statusList.map(status => (
                <option key={status} value={status}>{getStatusOptionLabel(status)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
