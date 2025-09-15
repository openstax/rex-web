import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MediaModal from './MediaModal';
import {
  HTMLElement,
  MouseEvent,
  KeyboardEvent,
  HTMLButtonElement,
  HTMLImageElement,
} from '@openstax/types/lib.dom';
import { assertDocument } from '../../../utils';

function createInteractionHandler(open: (content: ReactNode) => void) {
  return (e: MouseEvent | KeyboardEvent) => {
    const target = e.target as HTMLElement;

    const button = target.closest('button.image-button-wrapper') as HTMLButtonElement;
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
}

function createMediaModalPortal() {
  let setModalContent: ((content: ReactNode) => void) | null = null;

  const open = (content: ReactNode) => {
    setModalContent?.(content);
  };

  const MediaModalPortal: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [modalContent, setContent] = React.useState<ReactNode>(null);
    const document = assertDocument();

    useEffect(() => {
      setModalContent = (content) => {
        setContent(content);
        setIsOpen(true);
      };
      return () => {
        setModalContent = null;
      };
    }, []);

    useEffect(() => {
      if (!isOpen || typeof document === 'undefined') return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
          setIsOpen(false);
        }
      };


      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [document, isOpen]);
    return createPortal(
      <MediaModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {modalContent}
      </MediaModal>,
      document.body
    );
  };

  return { open, MediaModalPortal };
}

function createListeners(open: (content: ReactNode) => void) {
  let container: HTMLElement | null = null;
  const handleInteraction = createInteractionHandler(open);

  const attach = () => {
    if (!container) return;
    container.addEventListener('click', handleInteraction);
    container.addEventListener('keydown', handleInteraction);
  };

  const detach = () => {
    if (!container ) return;
    container.removeEventListener('click', handleInteraction);
    container.removeEventListener('keydown', handleInteraction);
  };

  const mount = (newContainer: HTMLElement) => {
    if (container !== newContainer) {
      detach();
      container = newContainer;
    }
    attach();
  };


  const unmount = () => {
    detach();
    container = null;
  };

  return { mount, unmount };
}

export function createMediaModalManager() {
  const { open, MediaModalPortal } = createMediaModalPortal();
  const { mount, unmount } = createListeners(open);

  return {
    open,
    MediaModalPortal,
    mount,
    unmount,
  };
}
