import React from 'react';
import { FormattedMessage } from 'react-intl';

import * as Styled from './ModalStyles';

interface PropTypes {
  onModalClose: () => void;
  footer: JSX.Element | null;
  body: JSX.Element | null;
  headerTextId: string;
  bodyTextId: string;
  className?: string;
}

// tslint:disable-next-line:variable-name
const ConfirmationModal = ({className, headerTextId, onModalClose, footer, bodyTextId, body }: PropTypes) => {
  return (
    <Styled.Modal className={className}>
      <Styled.CardWrapper>
        <Styled.Card>
          <Styled.Header>
            <FormattedMessage id={headerTextId}>
              {(message) => (
                <Styled.Heading>
                  {message}
                </Styled.Heading>
              )}
            </FormattedMessage>
            <Styled.CloseModalIcon onClick={onModalClose}/>
          </Styled.Header>
          <Styled.Body>
            <FormattedMessage id={bodyTextId}>
              {(msg) => <Styled.BodyHeading>{msg}</Styled.BodyHeading>}
            </FormattedMessage>
            {body}
          </Styled.Body>
          <Styled.Footer>
            {footer}
          </Styled.Footer>
        </Styled.Card>
      </Styled.CardWrapper>
      <Styled.Mask />
    </Styled.Modal>
  );
};

export default ConfirmationModal;
