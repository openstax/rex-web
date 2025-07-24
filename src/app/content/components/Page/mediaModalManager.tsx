import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MediaModal from './MediaModal';
import { HTMLElement, MouseEvent, KeyboardEvent, HTMLButtonElement, HTMLImageElement } from '@openstax/types/lib.dom';

export function createMediaModalManager() {
  let container: HTMLElement | null = null;
  let setModalContent: ((content: ReactNode) => void) | null = null;

  const open = (content: ReactNode) => {
    setModalContent?.(content);
  };

// tslint:disable-next-line:variable-name
  const MediaModalPortal = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [modalContent, setContent] = React.useState<ReactNode>(null);

    useEffect(() => {
      setModalContent = (content) => {
        setContent(content);
        setIsOpen(true);
      };
      return () => { setModalContent = null; };
    }, []);
    if (typeof document === 'undefined') return null;

    return isOpen ? createPortal(
      <MediaModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {modalContent}
      </MediaModal>,
      document.body
    ) : null;
  };

  const handleInteraction = (e: MouseEvent | KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button.image-button-wrapper') as HTMLButtonElement | null;
    if (!button) return;

    if (e.type === 'keydown') {
      const key = (e as KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ') return;
      e.preventDefault();
    }

    const img = button.querySelector('img') as HTMLImageElement | null;
    if (!img) return;

    open(
      <img
        tabIndex={0}
        src={img.src}
        alt={img.alt || ''}
        width={img.width}
        height={img.height}
      />
    );
  };

  const attachListeners = () => {
    if (!container) return;
    container.addEventListener('click', handleInteraction);
    container.addEventListener('keydown', handleInteraction);
  };

  const detachListeners = () => {
    if (!container) return;
    container.removeEventListener('click', handleInteraction);
    container.removeEventListener('keydown', handleInteraction);
  };

  const mount = (newContainer: HTMLElement) => {
    // detach from previous if different container
    if (container && container !== newContainer) {
      detachListeners();
    }

    container = newContainer;
    attachListeners();
  };

  const unmount = () => {
    detachListeners();
    container = null;
  };

  return {
    open,
    MediaModalPortal,
    mount,
    unmount,
  };
}
