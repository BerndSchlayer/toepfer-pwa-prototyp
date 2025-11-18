import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deApp from './locales/de/app.json';
import enApp from './locales/en/app.json';
import frApp from './locales/fr/app.json';
import roApp from './locales/ro/app.json';

const resources = {
  de: {
    app: deApp,
  },
  en: {
    app: enApp,
  },
  fr: {
    app: frApp,
  },
  ro: {
    app: roApp,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // Standardsprache
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
