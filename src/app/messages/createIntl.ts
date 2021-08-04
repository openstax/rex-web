import memoize from 'lodash/fp/memoize';
import { createIntl, createIntlCache } from 'react-intl';
// import Sentry from '../../helpers/Sentry';
import en from './en/index';

export default memoize((locale: string) => {
  const cache = createIntlCache();
  // let messages;

  // try {
  //   const localeMessages = import(`./en/index`);
  //   messages = localeMessages.default;
  // } catch (e) {
  //   const enMessages = import(`./en/index`);
  //   if (enMessages) {
  //     messages = enMessages.default;
  //   } else {
  //     messages = null;
  //   }
  //   Sentry.captureException(e);
  // }

  const intl = createIntl({
    locale,
    messages: en,
  }, cache);

  return intl;
});
