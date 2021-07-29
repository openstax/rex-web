import { createIntl, createIntlCache } from 'react-intl';
import Sentry from '../../helpers/Sentry';
import enMessages from '../messages/en/index';

export default () => {
  return {
    getIntlObject: async(locale: string) => {
        const cache = createIntlCache();
        let messages;

        try {
          const localeMessages = await import(`./${locale}/index`);
          messages = localeMessages.default;
        } catch (e) {
          messages = enMessages;
          Sentry.captureException(e);
        }

        const intl = createIntl({
          locale,
          messages,
        }, cache);

        return intl;
    },
  };
};
