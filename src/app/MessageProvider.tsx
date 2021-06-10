import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { book as bookSelector } from './content/selectors';
import { useServices } from './context/Services';
import { pathname as pathSelector } from './navigation/selectors';

// tslint:disable-next-line:variable-name
const MessageProvider = (props: { children?: React.ReactNode }) => {
  const book = useSelector(bookSelector);
  const currentPath = useSelector(pathSelector);
  const [polyfillLoaded, setPolyfillLoaded] = useState(false);
  const [intl, setIntl] = useState<IntlShape | null>(null);

  const lang = React.useMemo(() => {
    return currentPath === '/' ? 'en' : book?.language;
  }, [book, currentPath]);

  // https://formatjs.io/docs/polyfills/intl-pluralrules/#dynamic-import--capability-detection
  async function polyfill(locale: string | undefined) {
    if (!locale) {
      return;
    }

    if (shouldPolyfill()) {
      await import('@formatjs/intl-pluralrules/polyfill');
    }

    // boolean added by the polyfill
    if ((Intl.PluralRules as (typeof Intl.PluralRules & { polyfilled?: boolean })).polyfilled) {
      await import(`@formatjs/intl-pluralrules/locale-data/${locale}`);
      setPolyfillLoaded(true);
    }
  }
  const intlService = useServices().intl;

  useEffect(() => {
    if (!lang) {
      return;
    }

    polyfill(lang);

    async function fetchMyAPI() {
      const thing = await intlService.getIntlObject(lang);
      setIntl(thing);
    }

    fetchMyAPI();
  }, [intlService, lang]);

  return intl && (!shouldPolyfill() || polyfillLoaded) ? (
    <RawIntlProvider value={intl}>
      {props.children}
    </RawIntlProvider>
  ) : null;
};

export default MessageProvider;
