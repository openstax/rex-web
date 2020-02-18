import React from 'react';
import { FormattedMessage } from 'react-intl';

import * as Styled from './styles';

interface PropTypes {
  onModalClose: () => void;
  heading: string;
  subheading: string;
  className?: string;
}

// tslint:disable-next-line:variable-name
const Modal = ({
  className,
  heading,
  subheading,
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
          <Styled.Body>
            <FormattedMessage id={subheading}>
              {(msg) => <Styled.BodyHeading>{msg}</Styled.BodyHeading>}
            </FormattedMessage>
            {children}
          </Styled.Body>
        </Styled.Card>
      </Styled.CardWrapper>
      <Styled.Mask />
    </Styled.ModalWrapper>
  );
};

export default Modal;
