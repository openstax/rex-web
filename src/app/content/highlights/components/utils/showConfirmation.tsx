import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid/v4';
import MessageProvider from '../../../../MessageProvider';
import { assertDocument, assertNotNull } from '../../../../utils';
import ConfirmationModal from '../ConfirmationModal';

const createConfirmationQueue = () => {
  let currentlyOpenModal: null | Promise<boolean> = null;

  return async() => {
    if (currentlyOpenModal) {
      return currentlyOpenModal;
    }

    const document = assertDocument();
    const domNode = document.createElement('div');

    domNode.id = `dialog-discard-${uuid()}`;
    const root = assertNotNull(document.getElementById('root'), 'root element not found');
    root.insertAdjacentElement('afterend', domNode);

    currentlyOpenModal = new Promise((resolve) => {
      const confirm = () => resolve(true);
      const deny = () => resolve(false);
      ReactDOM.render(
        <MessageProvider>
          <ConfirmationModal deny={deny} confirm={confirm} />
        </MessageProvider>,
        domNode
      );
    });

    const userChoice: boolean = await currentlyOpenModal;
    currentlyOpenModal = null;

    ReactDOM.unmountComponentAtNode(domNode);
    assertNotNull(domNode.parentElement, 'parent element not found').removeChild(domNode);

    return userChoice;
  };
};

export default createConfirmationQueue();
