import { createIntl, createIntlCache } from 'react-intl';
import Sentry from '../../helpers/Sentry';
import enMessages from '../messages/en/index';

export default () => {
  return {
    getIntlObject: async(locale: string) => {
        const cache = createIntlCache();
        let messages = enMessages;

        import (`./${locale}/index.ts`)
        .then((localeMessages) => {
          messages = localeMessages.default;
        })
        .catch((e) => {
          Sentry.captureException(e);
        });

        const intl = createIntl({
          locale,
          messages,
        }, cache);

        return intl;
    },
  };
};
