import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { assertWindow } from '../utils/browser-assertions';
import createIntl from './createIntl';

// tslint:disable-next-line:variable-name
const SimpleMessageProvider = (props: { children?: React.ReactNode }) => {
  const [intl, setIntl] = useState<IntlShape | null>(null);

  useEffect(() => {
    const setUpIntl = async() => {
      const languageWithCode = assertWindow().navigator.language || 'en-US';
      const language =  new Intl.Locale(languageWithCode).language;
      const intlObject = await createIntl(language);
      setIntl(intlObject);
    };

    setUpIntl();
  }, []);

  return intl && (
    <RawIntlProvider value={intl}>
      {props.children}
    </RawIntlProvider>
  );
};

export default SimpleMessageProvider;
