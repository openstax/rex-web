import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import MediaModal from './MediaModal';
import { HTMLElement, HTMLDivElement } from '@openstax/types/lib.dom';

type ShowModal = (content: ReactNode) => void;

class ModalManager {
  private container: HTMLElement | null = null;
  private showModal: ShowModal | null = null;

  mount(setModalContent: ShowModal) {
    this.showModal = setModalContent;

    if (typeof document !== 'undefined' && !this.container) {
      this.container = document.createElement('div') as HTMLDivElement;
      this.container.id = 'media-modal-root';
      document.body.appendChild(this.container);
    }
  }

  open(content: ReactNode) {
    this.showModal?.(content);
  }
}

export const mediaModalManager = new ModalManager();

export function MediaModalPortal(): React.ReactPortal | null {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<ReactNode>(null);

  React.useEffect(() => {
    mediaModalManager.mount((content) => {
      setModalContent(content);
      setIsOpen(true);
    });
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <MediaModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {modalContent}
      </MediaModal>
    </>,
    document.body
  );
}
