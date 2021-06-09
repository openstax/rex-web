import { createIntl, createIntlCache } from 'react-intl';

export default () => {
  return {
    getIntlObject: async(locale: string = 'en') => {
        const cache = createIntlCache();

        const intl = createIntl({
          locale,
          messages: await import(`../app/messages/${locale}`),
        }, cache);

        return intl;
    },
  };
};
