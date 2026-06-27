import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { en, type TranslationKey } from './en';
import { ar } from './ar';

export type Lang = 'en' | 'ar';
export type Dir = 'ltr' | 'rtl';

const STORAGE_KEY = 'maibi-lang';
const CATALOGS: Record<Lang, Record<TranslationKey, string>> = { en, ar };

export type TFn = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

interface I18nValue {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  t: TFn;
}

const I18nContext = createContext<I18nValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'ar' ? 'ar' : 'en';
}

function applyDocumentLang(lang: Lang): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.lang = lang;
  el.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

/** Substitute `{name}` placeholders in a template with the provided values. */
function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  // Apply lang/dir on mount and whenever the language changes.
  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage may be unavailable (private mode) — ignore. */
    }
  }, []);

  const t = useCallback<TFn>(
    (key, vars) => {
      const catalog = CATALOGS[lang];
      // Fall back to English if a key is somehow missing in the active catalog.
      const template = catalog[key] ?? en[key] ?? key;
      return interpolate(template, vars);
    },
    [lang],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', setLang, t }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider');
  return ctx;
}

export type { TranslationKey };
