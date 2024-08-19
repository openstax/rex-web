import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import memoize from 'lodash/fp/memoize';
import { createIntl, createIntlCache } from 'react-intl';
import Sentry from '../../helpers/Sentry';

// https://formatjs.io/docs/polyfills/intl-pluralrules/#dynamic-import--capability-detection
async function polyfill(locale: string) {
  if (shouldPolyfill()) {
    await import(/* webpackChunkName: "intl-pluralrules" */ '@formatjs/intl-pluralrules/polyfill');
  }

  // boolean added by the polyfill
  if ((Intl.PluralRules as (typeof Intl.PluralRules & {polyfilled?: boolean})).polyfilled) {
    await import(
      /* webpackChunkName: "intl-pluralrules-[request]" */ `@formatjs/intl-pluralrules/locale-data/${locale}`
    );
  }
}

export default memoize(async(loc: string) => {
  await polyfill(loc);

  const cache = createIntlCache();
  let messages;
  let locale = loc;

  try {
    const localeMessages = await import(/* webpackChunkName: "intl-[request]" */  `./es/index`);
    messages = localeMessages.default;
  } catch (e) {
    const enMessages = await import(/* webpackChunkName: "intl-en-index" */ `./en/index`);
    locale = 'en';
    messages = enMessages.default;
    Sentry.captureException(e);
  }

  const intl = createIntl({
    locale,
    messages,
  }, cache);

  return intl;
});
