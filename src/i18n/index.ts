import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import en from './locales/en.json';
import es from './locales/es.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import el from './locales/el.json';
import zh from './locales/zh.json';
import th from './locales/th.json';
import ko from './locales/ko.json';
import sa from './locales/sa.json';
import eo from './locales/eo.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ru: { translation: ru },
  de: { translation: de },
  ja: { translation: ja },
  el: { translation: el },
  zh: { translation: zh },
  th: { translation: th },
  ko: { translation: ko },
  sa: { translation: sa },
  eo: { translation: eo },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto' },
];