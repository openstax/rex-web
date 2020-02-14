import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import Button from '../../../../components/Button';
import Modal from '../../../../components/Modal';
import MessageProvider from '../../../../MessageProvider';
import { assertDocument, assertNotNull } from '../../../../utils';

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
        <Modal
          onModalClose={deny}
          body={null}
          footer={
            <>
              <FormattedMessage id='i18n:discard:button:discard'>
                {(msg) => <Button
                  data-testid='discard-changes'
                  onClick={confirm}
                  variant='primary'
                  > {msg}
                </Button>}
              </FormattedMessage>
              <FormattedMessage id='i18n:discard:button:cancel'>
                {(msg) => <Button
                  data-testid='cancel-discard'
                  onClick={deny}
                  variant='secondary'
                  > {msg}
                </Button>}
              </FormattedMessage>
            </>
          }
          headerTextId='i18n:discard:heading'
          bodyTextId='i18n:discard:body'
        />
      </MessageProvider>,
      domNode
    );
  });

  ReactDOM.unmountComponentAtNode(domNode);
  assertNotNull(domNode.parentElement, 'parent element not found').removeChild(domNode);

  return userChoice;
};
