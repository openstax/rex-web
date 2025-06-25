import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MediaModal from './MediaModal';
import { HTMLElement, MouseEvent, KeyboardEvent, HTMLImageElement } from '@openstax/types/lib.dom';


export function createMediaModalManager(container: HTMLElement | null) {
  let setModalContent: ((content: ReactNode) => void) | null = null;

  const mount = (setContentHandler: (content: ReactNode) => void) => {
    setModalContent = setContentHandler;
    attachListeners();

  };

  const open = (content: ReactNode) => {
    setModalContent?.(content);
  };

  // tslint:disable-next-line:variable-name
  const MediaModalPortal = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [modalContent, setContent] = React.useState<ReactNode>(null);

    useEffect(() => {
      if (!isOpen || typeof document === 'undefined') return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      if (typeof document === 'undefined') return;

      const doc = document;

      doc.addEventListener('keydown', onKeyDown);
      return () => {
        doc.removeEventListener('keydown', onKeyDown);
      };
    }, [isOpen]);

    useEffect(() => {
        mount((content) => {
          setContent(content);
          setIsOpen(true);
        });
      }, []);

    if (typeof document === 'undefined') return null;

    return createPortal(
      <MediaModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {modalContent}
      </MediaModal>,
      document.body
    );
  };

  const handleMediaInteraction = (e: MouseEvent | KeyboardEvent) => {
    const target = e.target as HTMLImageElement;
    if (target.tagName !== 'IMG') return;

    if (e.type === 'keydown') {
      const key = (e as KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ') return;
      e.preventDefault();
    }

    open(<img tabIndex={0} src={target.src} alt={target.alt || ''}
        width={target.width} height={target.height} />);

  };

  const attachListeners = () => {
    if (!container) return;
    container.addEventListener('click', handleMediaInteraction);
    container.addEventListener('keydown', handleMediaInteraction);
  };

  const detachListeners = () => {
    if (!container) return;
    container.removeEventListener('click', handleMediaInteraction);
    container.removeEventListener('keydown', handleMediaInteraction);
  };

  return {
    mount,
    open,
    MediaModalPortal,
    detachListeners,
  };
}
