import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import { Body, BodyHeading, Footer } from '../../../components/Modal/styles';
import { closeConfirmationModal } from '../../actions';
import { confirmationModalOptions, isConfirmationModalOpen } from '../../selectors';

// tslint:disable-next-line:variable-name
const ConfirmationFooter = styled(Footer)`
  justify-content: space-between;
`;

// tslint:disable-next-line:variable-name
const ConfirmationModal = () => {
  const isOpen = useSelector(isConfirmationModalOpen);
  const dispatch = useDispatch();
  const {
    callback,
    headingi18nKey,
    bodyi18nKey,
    okButtoni18nKey,
    cancelButtoni18nKey,
  } = useSelector(confirmationModalOptions);

  const onConfirmation = () => {
    callback(true);
    dispatch(closeConfirmationModal());
  };

  const onDenial = () => {
    callback(false);
    dispatch(closeConfirmationModal());
  };

  if (!isOpen) { return null; }

  return <Modal onModalClose={onDenial} heading={headingi18nKey} data-test-id='confirmation-modal'>
      <Body>
        <FormattedMessage id={bodyi18nKey}>
          {(msg) => <BodyHeading>{msg}</BodyHeading>}
        </FormattedMessage>
      </Body>
      <ConfirmationFooter>
        <FormattedMessage id={okButtoni18nKey}>
          {(msg) => <Button
            data-test-id='confirmation-modal-ok-button'
            onClick={onConfirmation}
            variant='primary'
          > {msg}
          </Button>}
        </FormattedMessage>
        <FormattedMessage id={cancelButtoni18nKey}>
          {(msg) => <Button
            data-test-id='confirmation-modal-cancel-button'
            onClick={onDenial}
            variant='secondary'
          > {msg}
          </Button>}
        </FormattedMessage>
      </ConfirmationFooter>
    </Modal>;
};

export default ConfirmationModal;
