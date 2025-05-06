import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, formatInTimeZone } from 'date-fns-tz';
import { ptBR, enUS, es } from 'date-fns/locale';

type Language = 'en' | 'pt' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  formatDate: (date: Date, formatStr?: string) => string;
  formatTimeZone: (date: Date, timeZone: string, formatStr?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  formatDate: () => '',
  formatTimeZone: () => '',
});

const locales = {
  en: enUS,
  pt: ptBR,
  es: es,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    } else if (navigator.language.startsWith('pt')) {
      setLanguage('pt');
      i18n.changeLanguage('pt');
    } else if (navigator.language.startsWith('es')) {
      setLanguage('es');
      i18n.changeLanguage('es');
    }
  }, [i18n]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const formatDate = (date: Date, formatStr = 'PPpp') => {
    return format(date, formatStr, {
      locale: locales[language],
    });
  };

  const formatTimeZone = (date: Date, timeZone: string, formatStr = 'PPpp') => {
    return formatInTimeZone(date, timeZone, formatStr, {
      locale: locales[language],
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        formatDate,
        formatTimeZone,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}