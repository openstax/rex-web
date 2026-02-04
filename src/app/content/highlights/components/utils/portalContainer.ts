import { Highlight } from '@openstax/highlighter';
import type { HTMLElement } from '@openstax/types/lib.dom';
import { assertDocument } from '../../../../utils';

export const PORTAL_ATTR = 'data-highlight-portal';

const TEXT_NODE = 3;

// inject a container after the highlight's last <mark> element. the highlight
// card will be rendered into this container via react portal, giving it
// placement in the normal tab order.
export const injectPortalContainer = (highlight: Highlight): HTMLElement | null => {
  const doc = assertDocument();

  const existing = doc.querySelector(`[${PORTAL_ATTR}="${highlight.id}"]`);
  if (existing) {
    return existing as HTMLElement;
  }

  const portal = doc.createElement('div');
  portal.setAttribute(PORTAL_ATTR, highlight.id);
  portal.style.cssText = 'position:absolute;display:block;width:0;height:0;overflow:visible;font-size:0;line-height:0;';

  if (highlight.elements.length > 0) {
    const lastElement = highlight.elements[highlight.elements.length - 1] as HTMLElement;
    lastElement.parentNode?.insertBefore(portal, lastElement.nextSibling);
  } else if (highlight.range && highlight.range.endContainer) {
    // new selection, insert at range end
    const range = highlight.range;
    const endContainer = range.endContainer;

    if (endContainer.nodeType === TEXT_NODE) {
      endContainer.parentNode?.insertBefore(portal, endContainer.nextSibling);
    } else {
      const referenceNode = endContainer.childNodes[range.endOffset] || null;
      (endContainer as HTMLElement).insertBefore(portal, referenceNode);
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('Could not inject portal - no elements or range', highlight.id.substring(0, 8));
    return null;
  }

  return portal;
};

export const removePortalContainer = (highlightId: string): void => {
  const doc = assertDocument();
  const portal = doc.querySelector(`[${PORTAL_ATTR}="${highlightId}"]`);
  if (portal) {
    portal.remove();
  }
};

export const getPortalContainerForHighlight = (highlightId: string): HTMLElement | null => {
  return assertDocument().querySelector(`[${PORTAL_ATTR}="${highlightId}"]`);
};

export const isPortalContainer = (element: HTMLElement): boolean => {
  return element.hasAttribute(PORTAL_ATTR);
};
