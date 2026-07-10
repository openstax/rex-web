import React from 'react';
import { Book } from '../types';
import { hasOSWebData } from '../guards';
import { ConnectedLoginButton } from '../../components/NavBar';
import { user } from '../../auth/selectors';
import { useSelector } from 'react-redux';
import ModalWithScrollLock from '../../components/Modal';
import './LoginGate.css';

export default function LoginGate({
  book,
  children,
}: React.PropsWithChildren<{ book: Book }>) {

  if (!!useSelector(user) ||
    !hasOSWebData(book) ||
    !book.require_login_message_text) {
    return <>{children}</>;
  }
  return (
    <>
      {children}
      <ModalWithScrollLock
        className="login-gate-modal"
        heading='i18n:content-warning:heading:aria-label'
      >
        <div className="login-gate-centered">
          <div className="login-gate-message">
            <span dangerouslySetInnerHTML={{__html: book.require_login_message_text}} />
            <ConnectedLoginButton />
          </div>
        </div>
      </ModalWithScrollLock>
    </>
  );
}
