import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import MediaModal from './MediaModal';

type ShowModal = (content: ReactNode) => void;

class ModalManager {
  private container: HTMLElement;
  private showModal: ShowModal | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'media-modal-root';
    document.body.appendChild(this.container);
  }

  mount(setModalContent: ShowModal) {
    this.showModal = setModalContent;
  }

  open(content: ReactNode) {
    this.showModal?.(content);
  }

  unmount() {
    this.showModal = null;
  }
}

export const mediaModalManager = new ModalManager();

export function MediaModalPortal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<ReactNode>(null);

  React.useEffect(() => {
    mediaModalManager.mount((content) => {
      setModalContent(content);
      setIsOpen(true);
    });
    return () => mediaModalManager.unmount();
  }, []);

  return createPortal(
    <MediaModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {modalContent}
    </MediaModal>,
    document.body
  );
}
