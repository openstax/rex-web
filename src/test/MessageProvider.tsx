import React from 'react';
import { RawIntlProvider } from 'react-intl';
import createIntl from './createIntl';

interface Props {
  locale?: string;
  messages?: Record<string, string>;
}

const MessageProvider = ({children, ...props}: React.PropsWithChildren<Props>) => {
  const intlObject = createIntl(props.locale, props.messages);

  return <RawIntlProvider value={intlObject}>
    {children}
  </RawIntlProvider>;
};

export default MessageProvider;
