/**
 * Centralized in-memory page data cache for AngkorVerses Admin Portal.
 * 
 * Preserves fetched page datasets across route transitions so that navigating
 * between pages renders the complete page data INSTANTLY without showing
 * 2-second loading animations or spinners.
 */

const cache = new Map();

export const getPageCache = (key, fallback = null) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  return fallback;
};

export const setPageCache = (key, data) => {
  cache.set(key, data);
};

export const clearPageCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

export default {
  get: getPageCache,
  set: setPageCache,
  clear: clearPageCache,
};
