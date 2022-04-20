import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { assertWindow } from '../utils/browser-assertions';
import createIntl from './createIntl';

// tslint:disable-next-line:variable-name
const SimpleMessageProvider = (props: { children?: React.ReactNode }) => {
  const [intl, setIntl] = useState<IntlShape | null>(null);

  useEffect(() => {
    const setUpIntl = async() => {
      const languageWithCode = assertWindow().navigator.language || 'en';
      const Locale = assertWindow().Intl?.Locale;
      const language = Locale ? new Locale(languageWithCode).language : languageWithCode;
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
      {props.children}
    </RawIntlProvider>
  );
};

export default SimpleMessageProvider;
