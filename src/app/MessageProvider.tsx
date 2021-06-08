import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import React from 'react';
import { RawIntlProvider } from 'react-intl';
import { connect } from 'react-redux';
import * as select from './content/selectors';
import { Book } from './content/types';
import { useServices } from './context/Services';
import * as selectNavigation from './navigation/selectors';
import { AppState } from './types';

// https://formatjs.io/docs/polyfills/intl-pluralrules/#dynamic-import--capability-detection
async function polyfill(locale: string) {
  if (shouldPolyfill()) {
    await import('@formatjs/intl-pluralrules/polyfill');
  }

  // boolean added by the polyfill
  if ((Intl.PluralRules as (typeof Intl.PluralRules & {polyfilled?: boolean})).polyfilled) {
    await import(`@formatjs/intl-pluralrules/locale-data/${locale}`);
  }
}

polyfill('en');

// tslint:disable-next-line:variable-name
const MessageProvider = (props: {book?: Book, currentPath?: string, children?: React.ReactNode}) => {
  const lang = React.useMemo(() => {
    return props.currentPath === '/' ? 'en' : props.book?.language;
  }, [props.book, props.currentPath]);
  const intl = useServices().intl.getIntlObject(lang);

  return lang ? (
    <RawIntlProvider value={intl}>
      {props.children}
    </RawIntlProvider>
  ) : null;
};

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    currentPath: selectNavigation.pathname(state),
  })
)(MessageProvider);
