
import React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';

addLocaleData(en);

const messages = {
  'i18n:404': 'page not found',
};

const messageProvider: React.SFC<{}> = (props) => {
  return <IntlProvider locale={'en'} messages={messages}>{props.children}</IntlProvider>;
};

export default messageProvider;
