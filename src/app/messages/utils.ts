const AVAILABLE_LOCALES = ['en', 'es', 'pl'];
const DEFAULT_LOCALE = 'en';

export const availableLocaleOrDefault = (locale: string) => {
  return AVAILABLE_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
};
