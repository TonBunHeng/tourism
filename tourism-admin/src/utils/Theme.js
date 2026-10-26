// src/utils/Theme.js

export const THEME_CHANGE_EVENT = 'theme-changed';
export const SIDEBAR_STYLE_CHANGE_EVENT = 'sidebar-style-changed';
export const SIDEBAR_COMPACT_CHANGE_EVENT = 'sidebar-compact-changed';
export const FONT_SIZE_CHANGE_EVENT = 'font-size-changed';
export const FONT_FAMILY_CHANGE_EVENT = 'font-family-changed';
export const APPEARANCE_CHANGE_EVENT = 'appearance-changed';

/**
 * ========================================================
 * 1. THEME MODE MANAGEMENT (Light / Dark / System)
 * ========================================================
 */

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

  window.dispatchEvent(
    new CustomEvent(APPEARANCE_CHANGE_EVENT, {
      detail: { type: 'theme', value: theme }
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

/**
 * ========================================================
 * 2. NAVIGATION SIDEBAR CUSTOMIZATION (Style & Compact)
 * ========================================================
 */

/**
 * Get initial sidebar style ('modern' | 'light' | 'brand').
 * Defaults to 'modern'.
 * @returns {'modern' | 'light' | 'brand'}
 */
export const getInitialSidebarStyle = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('sidebar_style');
    if (saved && ['modern', 'light', 'brand'].includes(saved)) {
      return saved;
    }
  }
  return 'modern';
};

/**
 * Apply sidebar style by updating document attribute, localStorage, and event listeners.
 * @param {'modern' | 'light' | 'brand'} style 
 */
export const applySidebarStyle = (style) => {
  if (typeof window === 'undefined') return;

  const validStyle = ['modern', 'light', 'brand'].includes(style) ? style : 'modern';
  document.documentElement.setAttribute('data-sidebar-style', validStyle);

  try {
    localStorage.setItem('sidebar_style', validStyle);
  } catch (e) {
    console.error('Failed to save sidebar_style in localStorage', e);
  }

  window.dispatchEvent(
    new CustomEvent(SIDEBAR_STYLE_CHANGE_EVENT, {
      detail: { sidebarStyle: validStyle }
    })
  );

  window.dispatchEvent(
    new CustomEvent(APPEARANCE_CHANGE_EVENT, {
      detail: { type: 'sidebarStyle', value: validStyle }
    })
  );
};

/**
 * Get initial compact sidebar state.
 * @returns {boolean}
 */
export const getInitialCompactSidebar = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('compact_sidebar');
    if (saved !== null) {
      return saved === 'true';
    }
  }
  return false;
};

/**
 * Apply compact sidebar setting (immediately toggles compact mode & sets default startup state).
 * @param {boolean} isCompact 
 */
export const applyCompactSidebar = (isCompact) => {
  if (typeof window === 'undefined') return;

  const compact = Boolean(isCompact);
  try {
    localStorage.setItem('compact_sidebar', String(compact));
    // Also sync sidebar_expanded (compact means collapsed: isExpanded = false)
    localStorage.setItem('sidebar_expanded', JSON.stringify(!compact));
  } catch (e) {
    console.error('Failed to save compact_sidebar in localStorage', e);
  }

  window.dispatchEvent(
    new CustomEvent(SIDEBAR_COMPACT_CHANGE_EVENT, {
      detail: { compact, isExpanded: !compact }
    })
  );

  window.dispatchEvent(
    new CustomEvent(APPEARANCE_CHANGE_EVENT, {
      detail: { type: 'compactSidebar', value: compact }
    })
  );
};

/**
 * ========================================================
 * 3. TYPOGRAPHY & FONT SIZE MANAGEMENT
 * ========================================================
 */

/**
 * Get initial font size ('small' | 'medium' | 'large').
 * Defaults to 'medium'.
 * @returns {'small' | 'medium' | 'large'}
 */
export const getInitialFontSize = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('font_size');
    if (saved && ['small', 'medium', 'large'].includes(saved)) {
      return saved;
    }
  }
  return 'medium';
};

/**
 * Apply font size by updating html root font-size, attribute, and localStorage.
 * Small: 14px (compact data-dense layout)
 * Medium: 16px (standard default layout)
 * Large: 18px (high legibility layout)
 * @param {'small' | 'medium' | 'large'} size 
 */
export const applyFontSize = (size) => {
  if (typeof window === 'undefined') return;

  const validSize = ['small', 'medium', 'large'].includes(size) ? size : 'medium';
  const sizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };

  const root = document.documentElement;
  root.setAttribute('data-font-size', validSize);
  root.style.fontSize = sizeMap[validSize];

  try {
    localStorage.setItem('font_size', validSize);
  } catch (e) {
    console.error('Failed to save font_size in localStorage', e);
  }

  window.dispatchEvent(
    new CustomEvent(FONT_SIZE_CHANGE_EVENT, {
      detail: { fontSize: validSize, pixelSize: sizeMap[validSize] }
    })
  );

  window.dispatchEvent(
    new CustomEvent(APPEARANCE_CHANGE_EVENT, {
      detail: { type: 'fontSize', value: validSize }
    })
  );
};

/**
 * Get initial font family ('inter' | 'jakarta' | 'outfit' | 'roboto').
 * Defaults to 'inter'.
 * @returns {'inter' | 'jakarta' | 'outfit' | 'roboto'}
 */
export const getInitialFontFamily = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('font_family');
    if (saved && ['inter', 'jakarta', 'outfit', 'roboto'].includes(saved)) {
      return saved;
    }
  }
  return 'inter';
};

/**
 * Apply font family by updating document attribute, CSS variable, and localStorage.
 * @param {'inter' | 'jakarta' | 'outfit' | 'roboto'} family 
 */
export const applyFontFamily = (family) => {
  if (typeof window === 'undefined') return;

  const validFamily = ['inter', 'jakarta', 'outfit', 'roboto'].includes(family) ? family : 'inter';
  const root = document.documentElement;
  root.setAttribute('data-font-family', validFamily);

  try {
    localStorage.setItem('font_family', validFamily);
  } catch (e) {
    console.error('Failed to save font_family in localStorage', e);
  }

  window.dispatchEvent(
    new CustomEvent(FONT_FAMILY_CHANGE_EVENT, {
      detail: { fontFamily: validFamily }
    })
  );

  window.dispatchEvent(
    new CustomEvent(APPEARANCE_CHANGE_EVENT, {
      detail: { type: 'fontFamily', value: validFamily }
    })
  );
};

/**
 * ========================================================
 * 4. SYSTEM INITIALIZATION & EVENT LISTENERS
 * ========================================================
 */

let systemThemeCleanup = null;

/**
 * Initialize all appearance settings on application startup.
 */
export const initAppearance = () => {
  if (typeof window === 'undefined') return;

  // 1. Theme
  const theme = getInitialTheme();
  applyTheme(theme);

  // 2. Sidebar Style
  const sidebarStyle = getInitialSidebarStyle();
  applySidebarStyle(sidebarStyle);

  // 3. Compact Sidebar
  const isCompact = getInitialCompactSidebar();
  // Ensure sidebar_expanded is set appropriately if not explicitly stored
  if (localStorage.getItem('sidebar_expanded') === null) {
    localStorage.setItem('sidebar_expanded', JSON.stringify(!isCompact));
  }

  // 4. Font Size
  const fontSize = getInitialFontSize();
  applyFontSize(fontSize);

  // 5. Font Family
  const fontFamily = getInitialFontFamily();
  applyFontFamily(fontFamily);

  // System theme OS change listener
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

  return { theme, sidebarStyle, isCompact, fontSize, fontFamily };
};

/**
 * Backward compatibility alias for initTheme.
 */
export const initTheme = () => {
  return initAppearance();
};
