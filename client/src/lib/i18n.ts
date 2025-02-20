import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptTranslations from '../translations/pt.json';
import enTranslations from '../translations/en.json';

// Forçar o idioma padrão como português
localStorage.setItem('i18nextLng', 'pt');

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
    },
    detection: {
      order: ['localStorage'], // apenas usar localStorage, ignorar navegador
      caches: ['localStorage']
    }
  });

export default i18n;