import React from 'react';
import { FormattedMessage } from 'react-intl';

import * as Styled from './styles';

interface PropTypes {
  onModalClose: () => void;
  heading: string;
  className?: string;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
}

const Modal = ({
  className,
  heading,
  onModalClose,
  closeButtonRef,
  children,
}: React.PropsWithChildren<PropTypes>) => {
  return (
    <Styled.ModalWrapper className={className}>
      <Styled.CardWrapper>
        <Styled.Card>
          <Styled.Header>
            <FormattedMessage id={heading}>
              {(message) => (
                <Styled.Heading>
                  {message}
                </Styled.Heading>
              )}
            </FormattedMessage>
            <Styled.CloseModalIcon ref={closeButtonRef} onClick={onModalClose} />
          </Styled.Header>
          {children}
        </Styled.Card>
      </Styled.CardWrapper>
      <Styled.Mask />
    </Styled.ModalWrapper>
  );
};

export default Modal;
