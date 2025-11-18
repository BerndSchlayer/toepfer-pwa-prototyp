import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// Hole die gespeicherte Sprache aus localStorage oder verwende 'de' als Standard
const savedLanguage = localStorage.getItem('preferredLanguage') || 'de';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    fallbackLng: 'de',
    debug: false,
    
    // Lazy-Loading: Übersetzungsdateien werden erst bei Bedarf geladen
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
    },
    
    ns: ['app'],
    defaultNS: 'app',
    
    interpolation: {
      escapeValue: false,
    },
    
    // Lade die Sprache nur bei Bedarf
    load: 'languageOnly',
    preload: [savedLanguage],
  });

export default i18n;
