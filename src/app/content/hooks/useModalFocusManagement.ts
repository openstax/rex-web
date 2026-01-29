import React from 'react';
import { clearOpeningElement, getOpeningElement } from '../utils/focusManager';
import { HTMLElement } from '@openstax/types/lib.dom';

interface UseModalFocusManagementOptions {
  modalId: string;
  isOpen: boolean;
}

interface UseModalFocusManagementReturn {
  closeButtonRef: (element: HTMLElement | null) => void;
}

function closeButtonRef(element: HTMLElement | null) {
  element?.focus();
}

/**
 * Custom hook for managing focus in modal components.
 *
 * Implements WCAG-compliant focus management:
 * - Focuses the close button when modal opens
 * - Restores focus to the opening button when modal closes
 *
 * @param modalId - Unique identifier for the modal (used with focusManager)
 * @param isOpen - Boolean indicating whether the modal is currently open
 * @returns Object containing closeButtonRef callback for the close button
 */
export const useModalFocusManagement = ({
  modalId,
  isOpen,
}: UseModalFocusManagementOptions): UseModalFocusManagementReturn => {
  const openingElementRef = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    if (isOpen) {
      openingElementRef.current = getOpeningElement(modalId);
    } else if (openingElementRef.current) {
      openingElementRef.current.focus();
      clearOpeningElement(modalId);
      openingElementRef.current = null;
    }
  }, [isOpen, modalId]);

  return { closeButtonRef };
};

/**
 * Custom hook for managing focus in modals that only mount when open.
 *
 * Similar to useModalFocusManagement but optimized for components that
 * unmount when closed (like HighlightsPopUp).
 *
 * @param modalId - Unique identifier for the modal (used with focusManager)
 * @returns Object containing closeButtonRef callback for the close button
 */
export const useModalFocusManagementUnmounting = (
  modalId: string
): UseModalFocusManagementReturn => {
  const openingElementRef = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    openingElementRef.current = getOpeningElement(modalId);

    return () => {
      if (openingElementRef.current) {
        openingElementRef.current.focus();
        clearOpeningElement(modalId);
      }
    };
  }, [modalId]);

  return { closeButtonRef };
};
