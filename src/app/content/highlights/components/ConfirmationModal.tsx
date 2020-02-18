import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import { modalPadding } from '../../../components/Modal/styles';

interface Props {
  deny: () => void;
  confirm: () => void;
}

// tslint:disable-next-line:variable-name
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: ${modalPadding}rem;
`;

// tslint:disable-next-line:variable-name
const ConfirmationModal = ({deny, confirm}: Props) => {
  return <Modal onModalClose={deny} heading='i18n:discard:heading' subheading='i18n:discard:body'>
    <Footer>
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
