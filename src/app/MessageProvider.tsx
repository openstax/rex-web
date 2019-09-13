import React from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from './messages/en';

// tslint:disable-next-line:variable-name
const MessageProvider: React.SFC = (props) =>
  <IntlProvider locale='en' messages={enMessages}>{props.children}</IntlProvider>;

export default MessageProvider;
