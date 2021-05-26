import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';

export default (url: string) => {
  return {
    getIntlObject: () => {
        const cache = createIntlCache();

        export const intl = createIntl({
        locale: 'en',
        messages: enMessages,
        }, cache);
    }
  };
};
