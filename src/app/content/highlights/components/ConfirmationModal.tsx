import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import { Body, BodyHeading, Footer } from '../../../components/Modal/styles';
import { confirmationModalOptions, isConfirmationModalOpen } from '../../selectors';

// tslint:disable-next-line:variable-name
const ConfirmationFooter = styled(Footer)`
  justify-content: space-between;
`;

// tslint:disable-next-line:variable-name
const ConfirmationModal = () => {
  const isOpen = useSelector(isConfirmationModalOpen);
  const {
    callback,
    headingi18nKey,
    bodyi18nKey,
    okButtoni18nKey,
    cancelButtoni18nKey,
  } = useSelector(confirmationModalOptions);

  return isOpen
    ? <Modal onModalClose={() => callback(false)} heading={headingi18nKey}>
      <Body>
        <FormattedMessage id={bodyi18nKey}>
          {(msg) => <BodyHeading>{msg}</BodyHeading>}
        </FormattedMessage>
      </Body>
      <ConfirmationFooter>
        <FormattedMessage id={okButtoni18nKey}>
          {(msg) => <Button
            data-testid='confirmation-modal-ok-button'
            onClick={() => callback(true)}
            variant='primary'
          > {msg}
          </Button>}
        </FormattedMessage>
        <FormattedMessage id={cancelButtoni18nKey}>
          {(msg) => <Button
            data-testid='confirmation-modal-cancel-button'
            onClick={() => callback(false)}
            variant='secondary'
          > {msg}
          </Button>}
        </FormattedMessage>
      </ConfirmationFooter>
    </Modal>
    : null;
};

export default ConfirmationModal;
