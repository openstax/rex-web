import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import * as Styled from './Modal';

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
  const intl = useIntl();
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
              <Styled.CloseModalIcon
                ref={closeButtonRef}
                onClick={onModalClose}
                aria-label={intl.formatMessage({ id: 'i18n:modal:close' })}
              />
          </Styled.Header>
          {children}
        </Styled.Card>
      </Styled.CardWrapper>
      <Styled.Mask />
    </Styled.ModalWrapper>
  );
};

export default Modal;
