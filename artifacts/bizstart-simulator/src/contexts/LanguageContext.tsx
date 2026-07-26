import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, Lang } from '@/lib/translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isRTL: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('bizstart-lang') as Lang) || 'en';
    } catch {
      return 'en';
    }
  });

  const isRTL = lang === 'ar';

  // Sync dir + lang onto the html element so fixed-position elements respect RTL
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isRTL, lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('bizstart-lang', newLang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: string, ...args: any[]): string => {
      const val = translations[lang]?.[key];
      if (typeof val === 'function') return val(...args);
      if (typeof val === 'string') return val;
      // English fallback
      const fallback = translations.en[key];
      if (typeof fallback === 'function') return fallback(...args);
      if (typeof fallback === 'string') return fallback;
      return key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
