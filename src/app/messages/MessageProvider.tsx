import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { useServices } from '../context/Services';
import { assertDocument } from '../utils/browser-assertions';
import createIntl from './createIntl';
import { currentLocale } from './selectors';

const MessageProvider = (props: React.PropsWithChildren<{}>) => {
  const services = useServices();
  const [intl, setIntl] = useState<IntlShape | null>(services.intl.current);
  const bookLocale = useSelector(currentLocale);

  useEffect(() => {
    if (!bookLocale || intl) {
      return;
    }

    assertDocument().documentElement.lang = bookLocale;

    const setUpIntl = async() => {
      const intlObject = await createIntl(bookLocale);
      setIntl(intlObject);
    };

    setUpIntl();
  }, [bookLocale, intl]);

  return intl && (
    <RawIntlProvider value={intl}>
      {props.children}
    </RawIntlProvider>
  );
};

export default MessageProvider;
