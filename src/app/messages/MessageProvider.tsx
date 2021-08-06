import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { book as bookSelector } from '../content/selectors';
import { useServices } from '../context/Services';
import { match as matchSelector } from '../navigation/selectors';
import { assertDocument } from '../utils/browser-assertions';
import createIntl from './createIntl';

// tslint:disable-next-line:variable-name
const MessageProvider = (props: { children?: React.ReactNode }) => {
  const book = useSelector(bookSelector);
  const route = useSelector(matchSelector)?.route;
  const services = useServices();
  const [intl, setIntl] = useState<IntlShape | undefined>(services.intl);

  const bookLocale = React.useMemo(() => {
    return route?.locale || book?.language;
  }, [book, route]);

  useEffect(() => {
    if (!bookLocale) {
      return;
    }

    assertDocument().documentElement.lang = bookLocale;

    const setUpIntl = async() => {
      const intlObject = await createIntl(bookLocale);
      setIntl(intlObject);
    };

    setUpIntl();
  }, [bookLocale]);

  return intl ? (
    <RawIntlProvider value={intl}>
      {props.children}
    </RawIntlProvider>
  ) : null;
};

export default MessageProvider;
