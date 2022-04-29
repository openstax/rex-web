import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import ErrorBoundary from './ErrorBoundary';
import { assertWindow } from '../../utils/browser-assertions';
import createIntl from '../../messages/createIntl';
import { availableLocaleOrDefault } from '../../messages/utils';

// tslint:disable-next-line:variable-name
const OuterErrorBoundary = (props: { children?: React.ReactNode }) => {
  const [intl, setIntl] = useState<IntlShape | null>(null);

  useEffect(() => {
    const setUpIntl = async() => {
      let language = assertWindow().navigator.language;
      language = availableLocaleOrDefault(language.substring(0, 2));
      const intlObject = await createIntl(language);

      setIntl(intlObject);
    };

    setUpIntl();
  }, []);

  if (!intl) {
    return <>{props.children}</>;
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
