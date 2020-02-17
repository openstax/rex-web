import React from 'react';
import ReactDOM from 'react-dom';
import MessageProvider from '../../../../MessageProvider';
import { assertDocument, assertNotNull } from '../../../../utils';
import ConfirmationModal from '../ConfirmationModal';

export default async() => {
  const document = assertDocument();
  const domNode = document.createElement('div');

  domNode.id = `dialog-${Math.random().toString(36).substring(7)}`;
  const root = assertNotNull(document.getElementById('root'), 'root element not found');
  root.insertAdjacentElement('afterend', domNode);

  const userChoice: boolean = await new Promise((resolve) => {
    const confirm = () => resolve(true);
    const deny = () => resolve(false);
    ReactDOM.render(
      <MessageProvider>
        <ConfirmationModal {...{deny, confirm}} />
      </MessageProvider>,
      domNode
    );
  });

  ReactDOM.unmountComponentAtNode(domNode);
  assertNotNull(domNode.parentElement, 'parent element not found').removeChild(domNode);

  return userChoice;
};
