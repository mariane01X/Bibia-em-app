import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptTranslations from '../translations/pt.json';
import enTranslations from '../translations/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: ptTranslations },
      en: { translation: enTranslations }
    },
    lng: 'pt', // idioma padrão definido como português
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false // evita problemas de renderização
    }
  });

export default i18n;