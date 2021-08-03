import React from 'react';
import ReactDOM from 'react-dom';
import { RawIntlProvider } from 'react-intl';
import uuid from 'uuid/v4';
import createIntl from '../../../../messages/createIntl';
import { AppServices, MiddlewareAPI } from '../../../../types';
import { assertDocument, assertNotNull } from '../../../../utils';
import ConfirmationModal from '../ConfirmationModal';

export default async(services: AppServices & MiddlewareAPI) => {
  const document = assertDocument();
  const domNode = document.createElement('div');
  const state = services.getState();
  const { content } = state;
  const language = content!.book!.language;
  const intl = await createIntl(language);

  domNode.id = `dialog-${uuid()}`;
  const root = assertNotNull(document.getElementById('root'), 'root element not found');
  root.insertAdjacentElement('afterend', domNode);

  const userChoice: boolean = await new Promise((resolve) => {
    const confirm = () => resolve(true);
    const deny = () => resolve(false);
    ReactDOM.render(
      <RawIntlProvider value={intl}>
        <ConfirmationModal deny={deny} confirm={confirm} />
      </RawIntlProvider>,
      domNode
    );
  });

  ReactDOM.unmountComponentAtNode(domNode);
  assertNotNull(domNode.parentElement, 'parent element not found').removeChild(domNode);

  return userChoice;
};
