import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import { Body, BodyHeading, Footer } from '../../../components/Modal/styles';
import './ConfirmationModal.css';

interface Props {
  deny: () => void;
  confirm: () => void;
}

const ConfirmationModal = ({deny, confirm}: Props) => {
  return <Modal onModalClose={deny} heading='i18n:discard:heading'>
    <Body>
      <FormattedMessage id='i18n:discard:body'>
        {(msg) => <BodyHeading>{msg}</BodyHeading>}
      </FormattedMessage>
    </Body>
    <Footer className="confirmation-modal-footer">
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
    </Footer>
  </Modal>;
};

export default ConfirmationModal;
