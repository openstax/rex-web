import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import uuid from 'uuid';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import { Body, BodyHeading, Footer } from '../../../components/Modal/styles';
import { assertDocument, assertNotNull } from '../../../utils';
import { confirmationModalCallback, isConfirmationModalOpen } from '../selectors';

// tslint:disable-next-line:variable-name
const ConfirmationFooter = styled(Footer)`
  justify-content: space-between;
`;

// tslint:disable-next-line:variable-name
const ConfirmationModal = () => {
  const isOpen = useSelector(isConfirmationModalOpen);
  const callback = useSelector(confirmationModalCallback);
  const document = assertDocument();
  const modalNode = document.createElement('div');

  modalNode.id = `dialog-${uuid()}`;
  const root = assertNotNull(document.getElementById('root'), 'root element not found');

  React.useEffect(() => {
    if (isOpen) {
      root.appendChild(modalNode);
    }

    return () => {
      if (document.getElementById(modalNode.id)) {
        root.removeChild(modalNode);
      }
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, modalNode, root]);

  return ReactDOM.createPortal(
    <Modal onModalClose={() => callback('deny')} heading='i18n:discard:heading'>
      <Body>
        <FormattedMessage id='i18n:discard:body'>
          {(msg) => <BodyHeading>{msg}</BodyHeading>}
        </FormattedMessage>
      </Body>
      <ConfirmationFooter>
        <FormattedMessage id='i18n:discard:button:discard'>
          {(msg) => <Button
            data-testid='discard-changes'
            onClick={() => callback('confirm')}
            variant='primary'
          > {msg}
          </Button>}
        </FormattedMessage>
        <FormattedMessage id='i18n:discard:button:cancel'>
          {(msg) => <Button
            data-testid='cancel-discard'
            onClick={() => callback('deny')}
            variant='secondary'
          > {msg}
          </Button>}
        </FormattedMessage>
      </ConfirmationFooter>
    </Modal>,
    modalNode
  );
};

export default ConfirmationModal;
