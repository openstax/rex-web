import React from 'react';
import classNames from 'classnames';
import { MessageEvent } from '@openstax/types/lib.dom';
import { useModalFocusManagement } from '../../content/hooks/useModalFocusManagement';
import Modal from '../Modal';

export function ContactDialog({
  isOpen,
  close,
  contactFormParams,
  className,
}: {
  isOpen: boolean;
  close: () => void;
  contactFormParams?: { key: string; value: string }[];
  className?: string;
}) {
  const contactFormUrl = React.useMemo(() => {
    const formUrl = '/embedded/contact';

    if (contactFormParams !== undefined) {
      const params = contactFormParams
        .map(({ key, value }) => encodeURIComponent(`${key}=${value}`))
        .map((p) => `body=${p}`)
        .join('&');

      return `${formUrl}?${params}`;
    }

    return formUrl;
  }, [contactFormParams]);
  const { closeButtonRef } = useModalFocusManagement({ modalId: 'contactdialog', isOpen });

  return !isOpen ? null : (
    <Modal
      className={classNames('footer-contact-dialog', className)}
      onModalClose={close}
      heading='i18n:footer:column1:contact-us'
      closeButtonRef={closeButtonRef}
    >
      <iframe id='contact-us' title='contact-us' src={contactFormUrl} />
    </Modal>
  );
}

export function useContactDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  React.useEffect(
    () => {
      const win = window;

      const closeOnSubmit = ({ data }: MessageEvent) => {
        if (data === 'CONTACT_FORM_SUBMITTED') {
          close();
        }
      };

      win?.addEventListener('message', closeOnSubmit);
      return () => win?.removeEventListener('message', closeOnSubmit);
    },
    [close]
  );

  return { isOpen, open, close };
}
