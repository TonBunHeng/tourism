export const THEME_CHANGE_EVENT = 'theme-changed';

export const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
  }
  return 'system';
};

export const isDarkTheme = (theme) => {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

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

export const toggleTheme = (currentTheme) => {
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  return nextTheme;
};
