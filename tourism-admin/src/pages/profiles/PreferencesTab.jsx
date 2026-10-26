import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { getInitialTheme, applyTheme, THEME_CHANGE_EVENT } from '../../utils/Theme';

export default function PreferencesTab() {
  const [currentTheme, setCurrentTheme] = useState(() => getInitialTheme());

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
  };

  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail && e.detail.theme) {
        setCurrentTheme(e.detail.theme);
      } else {
        setCurrentTheme(getInitialTheme());
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleSync);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 md:p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-4">Theme Preferences</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor }
          ].map((theme) => {
            const Icon = theme.icon;
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                className={`p-3 sm:p-4 rounded-md border-2 transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'border-[var(--color-input)] bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
                    : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:border-[var(--color-input)]'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 ${isSelected ? 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]' : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]'}`} />
                <span className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 md:p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { id: 'push', label: 'Push Notifications', desc: 'Receive notifications in browser' },
            { id: 'sms', label: 'SMS Notifications', desc: 'Receive updates via SMS' }
          ].map((pref) => (
            <div key={pref.id} className="flex items-center justify-between gap-4 p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md">
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{pref.label}</p>
                <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{pref.desc}</p>
              </div>
              <button type="button" className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-md bg-[var(--color-primary)] transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-md bg-[var(--color-white)] translate-x-6" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 md:p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-4">Language & Region</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Language</label>
            <select className="w-full px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              <option>English</option>
              <option>Khmer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Timezone</label>
            <select className="w-full px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              <option>Asia/Phnom_Penh</option>
              <option>America/New_York</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
