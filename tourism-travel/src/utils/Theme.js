export const THEME_CHANGE_EVENT = 'theme-changed';

/**
 * Get initial theme mode ('light', 'dark', or 'system') stored in localStorage.
 * Defaults to 'system'.
 * @returns {'light' | 'dark' | 'system'}
 */
export const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
  }
  return 'system';
};

/**
 * Determine if dark mode should be active based on current theme setting.
 * @param {'light' | 'dark' | 'system'} theme 
 * @returns {boolean}
 */
export const isDarkTheme = (theme) => {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  // 'system' mode fallback
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

/**
 * Apply selected theme to HTML document element, update localStorage, and notify listeners.
 * @param {'light' | 'dark' | 'system'} theme 
 */
export const applyTheme = (theme) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark = isDarkTheme(theme);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.error('Failed to save theme in localStorage', e);
  }

  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: { theme, isDark }
    })
  );
};

/**
 * Toggle theme between 'light' and 'dark'.
 * @param {'light' | 'dark'} currentTheme 
 * @returns {'light' | 'dark'}
 */
export const toggleTheme = (currentTheme) => {
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  return nextTheme;
};

let systemThemeCleanup = null;

/**
 * Initialize theme on application startup and set up OS system theme change listeners.
 */
export const initTheme = () => {
  if (typeof window === 'undefined') return;

  const theme = getInitialTheme();
  applyTheme(theme);

  if (systemThemeCleanup) {
    systemThemeCleanup();
    systemThemeCleanup = null;
  }

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const currentStored = getInitialTheme();
      if (currentStored === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      systemThemeCleanup = () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      systemThemeCleanup = () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }

  return theme;
};

export default {
  getInitialTheme,
  isDarkTheme,
  applyTheme,
  toggleTheme,
  initTheme,
  THEME_CHANGE_EVENT,
};
