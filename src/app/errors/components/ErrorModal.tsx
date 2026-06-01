import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import Modal from '../../components/Modal';
import { Body, BodyHeading, Footer } from '../../components/Modal/styles';
import { AppState } from '../../types';
import { hideErrorDialog } from '../actions';
import * as select from '../selectors';
import ErrorIdList from './ErrorIdList';
import { useModalFocusManagement } from '../../content/hooks/useModalFocusManagement';

// Note: ErrorModal.css is imported globally from src/app/index.tsx to ensure consistent
// CSS ordering across code-split chunks

// Simple wrapper component to replace styled component
function BodyErrorText(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="body-error-text" />;
}

const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

const ErrorModal = () => {
  const dispatch = useDispatch();
  const show = useSelector((state: AppState) => select.showErrorDialog(state));
  const stack = useSelector((state: AppState) => select.getMessageIdStack(state));
  const clearError = () => dispatch(hideErrorDialog());

  const { closeButtonRef } = useModalFocusManagement({ modalId: 'errordialog', isOpen: show });

  if (!show) { return null; }

  return (
    <Modal
      className='error-modal'
      heading='i18n:error:boundary:heading'
      onModalClose={clearError}
    >
      <Body >
        <FormattedMessage id='i18n:error:boundary:sub-heading'>
          {(msg) => <BodyHeading id='modal-title'>{msg}</BodyHeading>}
        </FormattedMessage>
        <BodyWithLink values={{ supportCenterLink }} />
        <ErrorIdList ids={stack} />
      </Body>
      <Footer>
        <FormattedMessage id='i18n:error:boundary:action-btn-text'>
          {(msg) => <Button
            data-testid='clear-error'
            onClick={clearError}
            variant='primary'
            ref={closeButtonRef}
          >{msg}
          </Button>}
        </FormattedMessage>
      </Footer>
    </Modal>
  );
};

export default ErrorModal;
