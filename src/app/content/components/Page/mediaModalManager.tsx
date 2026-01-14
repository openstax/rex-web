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

function createInteractionHandler(open: (triggerButton: HTMLButtonElement) => void) {
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

    open(button);
  };
}

function createMediaModalPortal() {
  let setModalContent: ((triggerButton: HTMLButtonElement) => void) | null = null;

  const open = (triggerButton: HTMLButtonElement) => {
    setModalContent?.(triggerButton);
  };

  const MediaModalPortal: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [modalContent, setContent] = React.useState<ReactNode>(null);
    const [triggerButton, setTriggerButton] = React.useState<HTMLButtonElement | null>(null);

    useEffect(() => {
      setModalContent = (button) => {
        const img = button.querySelector('img') as HTMLImageElement | null;
        if (!img) return;

        const content = (
          <img
            tabIndex={0}
            src={img.src}
            alt={img.alt || ''}
            width={img.width}
            height={img.height}
          />
        );

        setContent(content);
        setTriggerButton(button);
        setIsOpen(true);
      };
      return () => {
        setModalContent = null;
      };
    }, []);

    const handleClose = React.useCallback(() => {
      setIsOpen(false);
      // Use setTimeout to ensure modal is fully closed before returning focus
      setTimeout(() => {
        triggerButton?.focus();
      }, 0);
    }, [triggerButton]);

    useEffect(() => {
      if (!isOpen || typeof document === 'undefined') return;
      const doc = assertDocument();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
          handleClose();
        }
      };
      doc.addEventListener('keydown', onKeyDown);
      return () => {
        doc.removeEventListener('keydown', onKeyDown);
      };
    }, [isOpen, handleClose]);

  if (typeof document === 'undefined' || !document?.body) return null;

    return createPortal(
      <MediaModal isOpen={isOpen} onClose={handleClose}>
        {modalContent}
      </MediaModal>,
      document.body
    );
  };

  return { open, MediaModalPortal };
}

function createListeners(open: (triggerButton: HTMLButtonElement) => void) {
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
