import React from 'react';
import { PagePropTypes } from './connector';
import { useServices } from '../../../context/Services';
import { OSWebBook } from '../../../../gateways/createOSWebLoader';
import styled from 'styled-components/macro';
import Button from '../../../components/Button';
import ModalWithScrollLock from '../Modal';
import cookie from './cookie';

// tslint:disable-next-line
const WarningDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  padding: 2rem;
  min-height: 50vh;
  top: 25vh;
  z-index: 4;

  > div {
    max-width: 80rem;
  }
`;

export default function ContentWarning({
  book,
}: {
  book: PagePropTypes['book'];
}) {
  const services = useServices();
  const [bookInfo, setBookInfo] = React.useState<OSWebBook | undefined>();
  const dismiss = React.useCallback(
    () => {
      // This is only called when bookInfo is populated
      cookie.setKey(cookieKey(bookInfo!.id.toString()), 'true', inAWeek());
      setBookInfo(undefined);
    },
    [bookInfo]
  );

  React.useEffect(() => {
    if (book) {
      services.osWebLoader.getBookFromId(book.id).then(setBookInfo);
    }
  }, [book, services]);

  if (!bookInfo?.content_warning_text || checkCookie(bookInfo.id.toString())) {
    return null;
  }

  return (
    <ModalWithScrollLock>
      <WarningDiv>
        <div>{bookInfo.content_warning_text}</div>
        <Button type='button' onClick={dismiss}>
          Ok
        </Button>
      </WarningDiv>
    </ModalWithScrollLock>
  );
}

function checkCookie(id: string) {
  return cookieKey(id) in cookie.hash;
}

function cookieKey(id: string) {
  return `content-warning-${id}`;
}

function inAWeek() {
  return new Date(Date.now() + 7 * 24 * 3600 * 1000);
}
