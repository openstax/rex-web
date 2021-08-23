import { createIntl, createIntlCache } from 'react-intl';
import enMessages from '../app/messages/en';
import plMessages from '../app/messages/pl';

export default (
  locale: string = 'en',
  messages?: Record<string, string>
) => {
    const cache = createIntlCache();

    const intl = createIntl({
      locale,
      messages: messages || (locale === 'pl' ? plMessages : enMessages),
    }, cache);

    return intl;
};
