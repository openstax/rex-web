import React from 'react';
import { FormattedMessage } from 'react-intl';

import * as Styled from './styles';

interface PropTypes {
  onModalClose: () => void;
  heading: string;
  className?: string;
}

const Modal = ({
  className,
  heading,
  onModalClose,
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
            <Styled.CloseModalIcon onClick={onModalClose}/>
          </Styled.Header>
          {children}
        </Styled.Card>
      </Styled.CardWrapper>
      <Styled.Mask />
    </Styled.ModalWrapper>
  );
};

export default Modal;
