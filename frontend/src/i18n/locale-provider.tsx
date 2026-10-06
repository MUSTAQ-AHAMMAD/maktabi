'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations, type Locale } from './translations';

interface LocaleContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = 'locale';

function resolve(locale: Locale, key: string): string {
  const parts = key.split('.');
  let node: unknown = translations[locale];
  for (const p of parts) {
    if (node && typeof node === 'object' && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p];
    } else { return key; }
  }
  return typeof node === 'string' ? node : key;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // hydrate from storage
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null;
    if (saved === 'en' || saved === 'ar') setLocaleState(saved);
  }, []);

  // reflect on <html> for RTL + language
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('lang', locale);
    el.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const toggle = useCallback(() => setLocale(locale === 'en' ? 'ar' : 'en'), [locale, setLocale]);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let out = resolve(locale, key);
    if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    return out;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, dir: locale === 'ar' ? 'rtl' : 'ltr', setLocale, toggle, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Safe fallback if used outside provider (e.g. isolated tests): English passthrough.
    return {
      locale: 'en' as Locale, dir: 'ltr' as const,
      setLocale: () => {}, toggle: () => {},
      t: (key: string) => resolve('en', key),
    };
  }
  return ctx;
}
