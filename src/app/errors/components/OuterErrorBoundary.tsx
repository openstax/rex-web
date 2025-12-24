import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import createIntl from '../../messages/createIntl';
import { availableLocaleOrDefault } from '../../messages/utils';
import { assertWindow } from '../../utils/browser-assertions';
import ErrorBoundary from './ErrorBoundary';

const OuterErrorBoundary = (props: React.PropsWithChildren<{ intl: IntlShape | null }>) => {
  const [intl, setIntl] = useState<IntlShape | null>(props.intl);

  useEffect(() => {
    const setUpIntl = async() => {
      let language = assertWindow().navigator.language;
      language = availableLocaleOrDefault(language.substring(0, 2));
      const intlObject = await createIntl(language);

      setIntl(intlObject);
    };

    if (!intl) {
      setUpIntl();
    }
  }, [intl]);

  if (!intl) {
    return null;
  }

  return (
    <RawIntlProvider value={intl}>
      <ErrorBoundary handlePromiseRejection>
        {props.children}
      </ErrorBoundary>
    </RawIntlProvider>
  );
};

export default OuterErrorBoundary;
