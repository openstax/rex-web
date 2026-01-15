import { HTMLElement } from '@openstax/types/lib.dom';
import { assertDocument } from '../../utils';

const openingElements = new Map<string, HTMLElement>();

export const captureOpeningElement = (modalId: string) => {
  const document = assertDocument();
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) {
    openingElements.set(modalId, activeElement);
  }
};

export const getOpeningElement = (modalId: string): HTMLElement | null => {
  return openingElements.get(modalId) || null;
};

export const clearOpeningElement = (modalId: string) => {
  openingElements.delete(modalId);
};
