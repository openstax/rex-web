import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button from '../../../components/Button';
import theme from '../../../theme';
import DiscardCard, { Footer } from './DiscardCard';

// tslint:disable-next-line:variable-name
const Mask = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.3);
`;

// tslint:disable-next-line:variable-name
const Modal = styled.div`
  top: 0;
  z-index: ${theme.zIndex.errorPopup};
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const CardWrapper = styled.div`
  z-index: 1;
`;

interface PropTypes {
  onAnswer: (answer: boolean) => void;
}

// tslint:disable-next-line:variable-name
const DiscardModal = ({ onAnswer }: PropTypes) => {
  const confirm = () => onAnswer(true);
  const deny = () => onAnswer(false);

  return (
    <Modal>
      <CardWrapper>
        <DiscardCard
          footer={
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
          }
          onModalClose={deny}
        />
      </CardWrapper>
      <Mask />
    </Modal>
  );
};

export default DiscardModal;
