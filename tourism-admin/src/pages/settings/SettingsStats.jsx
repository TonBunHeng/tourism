import { ShieldCheck, Globe, Database, Layers } from 'lucide-react';

export default function SettingsStats({ settings }) {
  const stats = [
    {
      label: 'Platform Status',
      value: settings.maintenanceMode ? 'Maintenance Mode' : 'Online & Active',
      subtext: settings.maintenanceMode ? 'Public traffic paused' : 'Public portal operating normally',
      icon: Layers,
      color: settings.maintenanceMode
        ? 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]'
        : 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: settings.maintenanceMode
        ? 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
        : 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      label: 'Security Posture',
      value: settings.twoFactorAuth ? '2FA Enforced' : 'Standard 2FA',
      subtext: `${settings.sessionTimeout || '30'}m timeout • ${settings.passwordPolicy || 'strong'} policy`,
      icon: ShieldCheck,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: 'Regional Locale',
      value: settings.defaultLanguage === 'km' ? 'Khmer (KM)' : 'English (EN)',
      subtext: `${settings.defaultCurrency || 'USD'} currency • Asia/Phnom_Penh`,
      icon: Globe,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    },
    {
      label: 'Backup Automation',
      value: settings.backupSchedule === 'disabled' ? 'Manual Only' : 'Automated Daily',
      subtext: `${settings.backupRetention || '30'} days snapshot retention`,
      icon: Database,
      color: 'text-[var(--color-primary)] dark:text-blue-400',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between h-[104px]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight truncate">
                  {stat.value}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center ${stat.bg}`}>
                <IconComponent className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2 truncate">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
