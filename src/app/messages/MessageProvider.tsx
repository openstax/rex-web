import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { useServices } from '../context/Services';

// tslint:disable-next-line:variable-name
const MessageProvider = (props: { children?: React.ReactNode }) => {
  const services = useServices();
  const [intl, setIntl] = useState<IntlShape | null>(null);

  useEffect(() => {
    if (!services.intl) {
      return;
    }
    setIntl(services.intl);
  }, [services]);

  return intl ? (
    <RawIntlProvider value={intl}>
      {props.children}
    </RawIntlProvider>
  ) : null;
};

export default MessageProvider;
