import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import React from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from './messages/en';

// https://formatjs.io/docs/polyfills/intl-pluralrules/#dynamic-import--capability-detection
async function polyfill(locale: 'en') {
  if (shouldPolyfill()) {
    await import('@formatjs/intl-pluralrules/polyfill');
  }

  // boolean added by the polyfill
  if ((Intl.PluralRules as (typeof Intl.PluralRules & {polyfilled?: boolean})).polyfilled) {
    switch (locale) {
      case 'en':
        await import('@formatjs/intl-pluralrules/locale-data/en');
        break;
      default:
        throw new Error('unsupported locale in messageProvider');
    }
  }
}

polyfill('en');

// tslint:disable-next-line:variable-name
const MessageProvider: React.SFC<{onError?: () => void}> = (props) =>
  <IntlProvider onError={props.onError} locale='en' messages={enMessages}>{props.children}</IntlProvider>;

export default MessageProvider;
