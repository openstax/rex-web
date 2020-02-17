import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';

interface Props {
  deny: () => void;
  confirm: () => void;
}

// tslint:disable-next-line:variable-name
const ConfirmationModal = ({deny, confirm}: Props) => <Modal
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
/>;

export default ConfirmationModal;
