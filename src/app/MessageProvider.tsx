import React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';

addLocaleData(en);

const messages = {
  'i18n:404': 'page not found',
  'i18n:a11y:skipToContent': 'Skip to Content',
  'i18n:toc:bookDetails': 'book details',
  'i18n:toc:title': 'Table of Contents',
  'i18n:toc:toggle:closed': 'Click to open the Table of Contents',
  'i18n:toc:toggle:opened': 'Click to close the Table of Contents',
};

// tslint:disable-next-line:variable-name
const MessageProvider: React.SFC = (props) =>
  <IntlProvider locale='en' messages={messages}>{props.children}</IntlProvider>;

export default MessageProvider;
