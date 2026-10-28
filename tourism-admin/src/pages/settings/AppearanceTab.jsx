import { useMemo } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  LayoutDashboard,
  Type,
  Maximize2
} from 'lucide-react';
import {
  applyTheme,
  applySidebarStyle,
  applyCompactSidebar,
  applyFontSize,
  applyFontFamily,
  getInitialCompactSidebar,
  getInitialFontSize,
  getInitialFontFamily
} from '../../utils/Theme';
import { useLanguage } from '../../i18n';

export default function AppearanceTab({ settings, setSettings }) {
  const { t } = useLanguage();

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));

    if (field === 'theme') {
      applyTheme(value);
    } else if (field === 'sidebarStyle') {
      applySidebarStyle(value);
    } else if (field === 'compactSidebar') {
      applyCompactSidebar(value);
    } else if (field === 'fontSize') {
      applyFontSize(value);
    } else if (field === 'fontFamily') {
      applyFontFamily(value);
    }
  };

  const themeOptions = useMemo(() => [
    {
      id: 'light',
      name: t('settings.themeLightName', 'Light Mode'),
      icon: Sun,
      desc: t('settings.themeLightDesc', 'Clean, crisp white interface tailored for daytime operations')
    },
    {
      id: 'dark',
      name: t('settings.themeDarkName', 'Dark Mode'),
      icon: Moon,
      desc: t('settings.themeDarkDesc', 'Sleek dark theme reducing eye fatigue in low-light environments')
    },
    {
      id: 'system',
      name: t('settings.themeSystemName', 'System Default'),
      icon: Monitor,
      desc: t('settings.themeSystemDesc', 'Automatically syncs with your operating system preference')
    }
  ], [t]);

  const sidebarOptions = useMemo(() => [
    {
      id: 'brand',
      name: t('settings.sidebarBrandName', 'Brand Navy'),
      color: 'bg-[#003E83]',
      desc: t('settings.sidebarBrandDesc', 'Official Ministry of Tourism deep navy blue')
    },
    {
      id: 'modern',
      name: t('settings.sidebarModernName', 'Modern Charcoal'),
      color: 'bg-slate-900 dark:bg-zinc-900',
      desc: t('settings.sidebarModernDesc', 'Neutral modern dark charcoal navigation')
    },
    {
      id: 'light',
      name: t('settings.sidebarLightName', 'Clean White'),
      color: 'bg-white border border-gray-300',
      desc: t('settings.sidebarLightDesc', 'High-contrast light minimalist sidebar')
    }
  ], [t]);

  const fontSizeOptions = useMemo(() => [
    {
      id: 'small',
      name: t('settings.fontScaleSmallName', 'Compact (14px)'),
      desc: t('settings.fontScaleSmallDesc', 'High information density for large monitors')
    },
    {
      id: 'medium',
      name: t('settings.fontScaleMediumName', 'Standard (16px)'),
      desc: t('settings.fontScaleMediumDesc', 'Optimal balance of legibility and density')
    },
    {
      id: 'large',
      name: t('settings.fontScaleLargeName', 'Comfort (18px)'),
      desc: t('settings.fontScaleLargeDesc', 'Enlarged text for higher reading comfort')
    }
  ], [t]);

  const fontFamilyOptions = useMemo(() => [
    {
      id: 'inter',
      name: t('settings.fontInterName', 'Inter Display'),
      desc: t('settings.fontInterDesc', 'Modern geometric sans-serif standard')
    },
    {
      id: 'jakarta',
      name: t('settings.fontJakartaName', 'Plus Jakarta Sans'),
      desc: t('settings.fontJakartaDesc', 'Contemporary high-contrast humanist font')
    },
    {
      id: 'outfit',
      name: t('settings.fontOutfitName', 'Outfit Modern'),
      desc: t('settings.fontOutfitDesc', 'Distinctive brand display typography')
    }
  ], [t]);

  const activeTheme = settings.theme || 'system';
  const activeSidebarStyle = settings.sidebarStyle || 'brand';
  const activeCompact = settings.compactSidebar !== undefined ? Boolean(settings.compactSidebar) : getInitialCompactSidebar();
  const activeFontSize = settings.fontSize || getInitialFontSize();
  const activeFontFamily = settings.fontFamily || getInitialFontFamily();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {t('settings.appearanceTitle', 'Appearance & Theme Settings')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          {t('settings.appearanceSubtitle', 'Customize the administrative portal visual theme, contrast mode, typography, and navigation sidebar styling.')}
        </p>
      </div>

      {/* Card 1: Dark / Light Mode */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Sun className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardColorTheme', 'Color Theme Mode')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = activeTheme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChange('theme', opt.id)}
                className={`flex flex-col items-start p-4 rounded-md border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] ring-2 ring-[var(--color-primary)]/20'
                    : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 text-[var(--color-primary)]">
                    <Check className="w-4 h-4" />
                  </span>
                )}
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]'}`} />
                <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                  {opt.name}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 leading-relaxed">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 2: Sidebar Accent Preference */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-[var(--color-primary)]" />
            {t('settings.cardSidebarStyle', 'Navigation Sidebar Style')}
          </h3>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{t('settings.compactModeLabel', 'Compact Mode:')}</span>
            <input
              type="checkbox"
              checked={activeCompact}
              onChange={(e) => handleChange('compactSidebar', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-md peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)] relative"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sidebarOptions.map((opt) => {
            const isSelected = activeSidebarStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChange('sidebarStyle', opt.id)}
                className={`flex items-start gap-3 p-4 rounded-md border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] ring-2 ring-[var(--color-primary)]/20'
                    : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]'
                }`}
              >
                <div className={`w-6 h-6 rounded-md shrink-0 mt-0.5 ${opt.color}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] block">
                    {opt.name}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5 block">
                    {opt.desc}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[var(--color-primary)] shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 3: Typography Scale & Font Family */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Type className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardTypography', 'Typography & Base Font Sizing')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Font Size */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('settings.labelInterfaceScale', 'Interface Base Scale')}
            </label>
            <div className="space-y-2">
              {fontSizeOptions.map((opt) => {
                const isSelected = activeFontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('fontSize', opt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] ring-1 ring-[var(--color-primary)]/20'
                        : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] block">
                        {opt.name}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        {opt.desc}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('settings.labelFontFamily', 'Primary Font Family')}
            </label>
            <div className="space-y-2">
              {fontFamilyOptions.map((opt) => {
                const isSelected = activeFontFamily === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('fontFamily', opt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] ring-1 ring-[var(--color-primary)]/20'
                        : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] block">
                        {opt.name}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        {opt.desc}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
