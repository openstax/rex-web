import React from 'react';
import { Book } from '../types';
import { hasOSWebData } from '../guards';
import { ConnectedLoginButton } from '../../components/NavBar';
import { user } from '../../auth/selectors';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

// tslint:disable-next-line:variable-name
const WarningDiv = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.8rem;
  padding: 8rem 1.5rem;

  > div {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: 60rem;

    a {
      place-self: center;
    }
  }
`;

export default function LoginGate({
  book,
  children,
}: React.PropsWithChildren<{ book: Book }>) {
  const authenticated = !!useSelector(user);

  if (
    authenticated ||
    !hasOSWebData(book) ||
    !book.require_login_message_text
  ) {
    return <>{children}</>;
  }
  return (
    <WarningDiv>
      <div>
        {book.require_login_message_text}
        <ConnectedLoginButton />
      </div>
    </WarningDiv>
  );
}
