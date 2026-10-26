import { ChevronDown, Sliders } from 'lucide-react';

export default function SettingsTabs({ tabs, activeTab, onTabChange, searchMatchCounts = {} }) {
  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];
  const CurrentIcon = currentTab?.icon || Sliders;

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title with icon & badge matching other pages */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {currentTab?.label?.includes('Settings') ? currentTab.label : `${currentTab?.label || 'General'} Settings`}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
            Section {Math.max(1, tabs.findIndex((t) => t.id === activeTab) + 1)} of {tabs.length}
          </span>
        </div>

        {/* Section Dropdown Selector */}
        <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={activeTab}
              onChange={(e) => onTabChange(e.target.value)}
              className="appearance-none w-full sm:w-64 pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {tabs.map((tab) => {
                const matchCount = searchMatchCounts[tab.id];
                const labelSuffix = !tab.label.includes('Settings') ? ' Settings' : '';
                return (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}{labelSuffix}{matchCount ? ` (${matchCount} matches)` : ''}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
