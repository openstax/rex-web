import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum, HighlightUpdateColorEnum, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { Element, HTMLElement, } from '@openstax/types/lib.dom';
import { findElementSelfOrParent } from '../../../domUtils';
import { assertWindow } from '../../../utils';
import { HighlightData } from '../types';

export const getHighlightOffset = (container: HTMLElement | undefined, highlight: Highlight) => {
  if (!container || !highlight.range || !highlight.range.getBoundingClientRect) {
    return;
  }

  const {top, bottom } = highlight.range.getBoundingClientRect();

  const offsetParent = container.offsetParent && findElementSelfOrParent(container.offsetParent);
  const parentOffset = offsetParent ? offsetParent.offsetTop : 0;
  const scrollOffset = assertWindow().scrollY;

  return {
    bottom: bottom - parentOffset + scrollOffset,
    top: top - parentOffset + scrollOffset,
  };
};

export const getHighlightTopOffset = (container: HTMLElement | undefined, highlight: Highlight): number | undefined => {
  const offset = getHighlightOffset(container, highlight);

  if (offset) {
    return offset.top;
  }
};

export const getHighlightBottomOffset = (
  container: HTMLElement | undefined,
  highlight: Highlight
): number | undefined => {
  const offset = getHighlightOffset(container, highlight);

  if (offset) {
    return offset.bottom;
  }
};

export const generateUpdatePayload = (
  oldData: Pick<HighlightData, 'color' | 'annotation'>,
  update: {color?: HighlightColorEnum, annotation?: string, id: string }
): {
  updatePayload: UpdateHighlightRequest,
  preUpdateData: UpdateHighlightRequest
} => {
  const oldColor = oldData.color as string as HighlightUpdateColorEnum;
  const newColor = update.color !== undefined
    ? update.color as string as HighlightUpdateColorEnum
    : oldColor;

  const updatePayload = {
    highlight: {
      annotation: update.annotation !== undefined ? update.annotation : oldData.annotation,
      color: newColor,
    },
    id: update.id,
  };

  const preUpdateData = {
    highlight: {
      annotation: oldData.annotation,
      color: oldColor,
    },
    id: update.id,
  };

  return {updatePayload, preUpdateData};
};

export const noopKeyCombinationHandler = (activeElement: Element): boolean => {
  if (activeElement.nodeName === 'TEXTAREA') { return true; }
  return false;
};
