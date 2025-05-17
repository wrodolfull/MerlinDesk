import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { format as formatDate, formatRelative, formatDistance } from 'date-fns';
import { enUS, ptBR, es } from 'date-fns/locale';
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

const locales = { enUS, ptBR, es };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (value instanceof Date) {
          const locale = lng === 'pt' ? locales.ptBR : 
                        lng === 'es' ? locales.es : 
                        locales.enUS;

          switch (format) {
            case 'date':
              return formatDate(value, 'PP', { locale });
            case 'time':
              return formatDate(value, 'p', { locale });
            case 'relative':
              return formatRelative(value, new Date(), { locale });
            case 'ago':
              return formatDistance(value, new Date(), { 
                locale,
                addSuffix: true 
              });
            default:
              return formatDate(value, format || 'Pp', { locale });
          }
        }
        return value;
      }
    }
  });

export default i18n;