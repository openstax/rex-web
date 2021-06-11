import { createIntl, createIntlCache } from 'react-intl';

export default () => {
  return {
    getIntlObject: async(locale: string) => {
        const cache = createIntlCache();
        const messages = await require(`./${locale}`).default;

        const intl = createIntl({
          locale,
          messages,
        }, cache);

        return intl;
    },
  };
};
