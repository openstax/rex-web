import React from 'react';
import { useServices } from '../../context/Services';
import { OSWebBook } from '../../../gateways/createOSWebLoader';
import { Book } from '../types';
import { HTMLDivElement } from '@openstax/types/lib.dom';
import styled from 'styled-components/macro';
import Button from '../../components/Button';
import Modal from './Modal';
import theme from '../../theme';
import Cookies from 'js-cookie';
import { useTrapTabNavigation } from '../../reactUtils';
import { assertDocument } from '../../utils';

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

function WarningDivWithTrap({
  text,
  dismiss,
}: {
  text: string;
  dismiss: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Demand focus
  React.useEffect(
    () => {
      const document = assertDocument();
      const grabFocus = () => {
        if (!ref.current?.contains(document.activeElement)) {
          ref.current?.focus();
        }
      };

      grabFocus();
      document.body.addEventListener('focusin', grabFocus);

      return () => document.body.removeEventListener('focusin', grabFocus);
    },
    []
  );

  useTrapTabNavigation(ref);

  return (
    <WarningDiv tabIndex='-1' ref={ref}>
      <div>{text}</div>
      <Button type='button' onClick={dismiss}>
        Ok
      </Button>
    </WarningDiv>
  );
}

export default function ContentWarning({ book }: { book: Book }) {
  const services = useServices();
  const [bookInfo, setBookInfo] = React.useState<OSWebBook | undefined>();
  const cookieKey = `content-warning-${bookInfo?.id}`;
  const dismiss = React.useCallback(() => {
    // This is only called when bookInfo is populated
    Cookies.set(cookieKey, 'true', { expires: 28 });
    setBookInfo(undefined);
  }, [cookieKey]);

  React.useEffect(() => {
    services.osWebLoader.getBookFromId(book.id).then(setBookInfo);
  }, [book, services]);

  if (!bookInfo?.content_warning_text || Cookies.get(cookieKey)) {
    return null;
  }

  return (
    <Modal
      ariaLabel='Content warning'
      tabIndex='-1'
      scrollLockProps={{
        mediumScreensOnly: false,
        overlay: true,
        zIndex: theme.zIndex.highlightSummaryPopup,
      }}
    >
      <WarningDivWithTrap
        text={bookInfo.content_warning_text}
        dismiss={dismiss}
      />
    </Modal>
  );
}
