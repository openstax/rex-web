import React from 'react';
import { Book } from '../types';
import { HTMLDivElement } from '@openstax/types/lib.dom';
import styled from 'styled-components/macro';
import Button from '../../components/Button';
import Modal from './Modal';
import theme from '../../theme';
import Cookies from 'js-cookie';
import { useTrapTabNavigation } from '../../reactUtils';
import { assertDocument } from '../../utils';
import { hasOSWebData } from '../guards';
import { tuple } from '../../utils';

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
      <div dangerouslySetInnerHTML={{__html: text}} />
      <Button type='button' onClick={dismiss}>
        Ok
      </Button>
    </WarningDiv>
  );
}

const useDismiss = (book: Book) => {
  const cookieKey = `content-warning-${book.id}`;
  const [isShown, setIsShown] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsShown(Cookies.get(cookieKey) !== 'true');
    }
  }, [cookieKey]);

  const dismiss = React.useCallback(() => {
    Cookies.set(cookieKey, 'true', { expires: 28 });
    setIsShown(false);
  }, [cookieKey]);

  return tuple(isShown, dismiss);
};

export default function ContentWarning({ book }: { book: Book }) {
  const [isShown, dismiss] = useDismiss(book);

  if (!hasOSWebData(book) || !book.content_warning_text || !isShown) {
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
        text={book.content_warning_text}
        dismiss={dismiss}
      />
    </Modal>
  );
}
