import { createIntl, createIntlCache } from 'react-intl';
import messages from '../app/messages/en';

export default () => {
  return {
    getIntlObject: (locale: string = 'en') => {
        const cache = createIntlCache();

        const intl = createIntl({
          locale,
          messages,
        }, cache);

        return intl;
    },
  };
};
