import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en';
import kh from './kh';

export const translations = {
  EN: en,
  KH: kh,
  en,
  kh,
  km: kh,
};

const LanguageContext = createContext({
  language: 'EN',
  currentLang: 'EN',
  setLanguage: () => { },
  t: (key, fallbackOrParams, maybeParams) => {
    const fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : key;
    const params = typeof fallbackOrParams === 'object' && fallbackOrParams !== null ? fallbackOrParams : maybeParams;
    return interpolate(fallback, params);
  },
});

export const normalizeLang = (l) => {
  if (!l) return 'EN';
  const upper = String(l).toUpperCase().trim();
  if (upper === 'KH' || upper === 'KM' || upper === 'KHMER') return 'KH';
  return 'EN';
};

export const interpolate = (str, params) => {
  if (typeof str !== 'string' || !params || typeof params !== 'object') {
    return str;
  }
  return str.replace(/\{(\w+)\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined && params[paramKey] !== null
      ? String(params[paramKey])
      : match;
  });
};

export const translate = (key, lang = 'EN', fallbackOrParams, maybeParams) => {
  let fallback = undefined;
  let params = undefined;

  if (fallbackOrParams && typeof fallbackOrParams === 'object' && !Array.isArray(fallbackOrParams)) {
    params = fallbackOrParams;
  } else {
    fallback = fallbackOrParams;
    if (maybeParams && typeof maybeParams === 'object' && !Array.isArray(maybeParams)) {
      params = maybeParams;
    }
  }

  const normalized = normalizeLang(lang);
  const dict = translations[normalized] || translations.EN;
  const parts = (key || '').split('.');
  let cur = dict;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in cur) {
      cur = cur[part];
    } else {
      cur = undefined;
      break;
    }
  }
  if (typeof cur === 'string') return interpolate(cur, params);
  const resolved = fallback !== undefined ? fallback : key;
  return typeof resolved === 'string' ? interpolate(resolved, params) : resolved;
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem('app_language');
      return normalizeLang(stored);
    } catch {
      return 'EN';
    }
  });

  const setLanguage = useCallback((newLang) => {
    const normalized = normalizeLang(newLang);
    setLanguageState(normalized);
    try {
      localStorage.setItem('app_language', normalized);
      window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: normalized } }));
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'app_language' && e.newValue) {
        setLanguageState(normalizeLang(e.newValue));
      }
    };
    const handleCustom = (e) => {
      if (e?.detail?.lang) {
        setLanguageState(normalizeLang(e.detail.lang));
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('language-changed', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('language-changed', handleCustom);
    };
  }, []);

  // Update html lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'KH' ? 'km' : 'en';
    }
  }, [language]);

  const t = useCallback((key, fallbackOrParams, maybeParams) => {
    if (!key) return '';

    let fallback = undefined;
    let params = undefined;

    if (fallbackOrParams && typeof fallbackOrParams === 'object' && !Array.isArray(fallbackOrParams)) {
      params = fallbackOrParams;
    } else {
      fallback = fallbackOrParams;
      if (maybeParams && typeof maybeParams === 'object' && !Array.isArray(maybeParams)) {
        params = maybeParams;
      }
    }

    const dict = translations[language] || translations.EN;
    const parts = key.split('.');
    let cur = dict;
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = cur[part];
      } else {
        cur = undefined;
        break;
      }
    }

    if (cur !== undefined && typeof cur === 'string') {
      return interpolate(cur, params);
    }

    // fallback to English
    if (language !== 'EN') {
      let enCur = translations.EN;
      for (const part of parts) {
        if (enCur && typeof enCur === 'object' && part in enCur) {
          enCur = enCur[part];
        } else {
          enCur = undefined;
          break;
        }
      }
      if (enCur !== undefined && typeof enCur === 'string') {
        return interpolate(enCur, params);
      }
    }

    const resolvedFallback = fallback !== undefined ? fallback : key;
    return typeof resolvedFallback === 'string' ? interpolate(resolvedFallback, params) : resolvedFallback;
  }, [language]);

  const value = {
    language,
    currentLang: language,
    setLanguage,
    t,
  };

  return React.createElement(
    LanguageContext.Provider,
    { value },
    children
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

export const useTranslation = useLanguage;
export default translations;
