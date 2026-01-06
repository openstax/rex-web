import React from 'react';
import { Book } from '../types';
import { hasOSWebData } from '../guards';
import { ConnectedLoginButton } from '../../components/NavBar';
import { user } from '../../auth/selectors';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import ModalWithScrollLock from '../../components/Modal';
import { useIntl } from 'react-intl';

const Modal = styled(ModalWithScrollLock)`
  width: 100vw;

  > div:first-child > div {
    width: auto;
  }

  header {
    padding: 0.5rem 3rem;

    > svg {
      display: none;
    }
  }

  > :last-child {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const Centered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70vw;
  height: 70vh;
`;

const Message = styled.div`
  padding: 0.5rem 3rem;
  max-width: 60rem;

  a {
    place-self: center;
  }
`;

export default function LoginGate({
  book,
  children,
}: React.PropsWithChildren<{ book: Book }>) {
  const intl = useIntl();
  if (!!useSelector(user) ||
    !hasOSWebData(book) ||
    !book.require_login_message_text) {
    return <>{children}</>;
  }
  return (
    <>
      {children}
      <Modal heading={intl.formatMessage({ id: 'i18n:content-warning:heading:aria-label' })}>
        <Centered>
          <Message>
            <span dangerouslySetInnerHTML={{__html: book.require_login_message_text}} />
            <ConnectedLoginButton />
          </Message>
        </Centered>
      </Modal>
    </>
  );
}
