import { useEffect } from 'react';

/**
 * Sets the browser document title dynamically.
 * Formats as: `${title} | ${suffix}` (defaults to AngkorVerses).
 * If title is empty or identical to suffix, sets `${suffix}`.
 */
export function setPageTitle(title, suffix = 'AngkorVerses') {
  if (typeof document === 'undefined') return;

  if (title && title !== suffix) {
    document.title = `${title} | ${suffix}`;
  } else {
    document.title = suffix;
  }
}

/**
 * React hook to set document title on mount / dependency change.
 */
export function usePageTitle(title, suffix = 'AngkorVerses') {
  useEffect(() => {
    if (title) {
      setPageTitle(title, suffix);
    }
  }, [title, suffix]);
}