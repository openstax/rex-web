import memoize from 'lodash/fp/memoize';
import { createIntl, createIntlCache } from 'react-intl';
import Sentry from '../../helpers/Sentry';

export default memoize(async(locale: string) => {
  const cache = createIntlCache();
  let messages;

  try {
    const localeMessages = await import(`./${locale}/index`);
    messages = localeMessages.default;
  } catch (e) {
    const enMessages = await import(`./en/index`);
    messages = enMessages.default;
    Sentry.captureException(e);
  }

  const intl = createIntl({
    locale,
    messages,
  }, cache);

  return intl;
});
