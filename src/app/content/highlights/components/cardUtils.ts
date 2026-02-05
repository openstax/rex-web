import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum, HighlightUpdateColorEnum, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { Element, HTMLElement, Selection } from '@openstax/types/lib.dom';
import React from 'react';
import { findElementSelfOrParent } from '../../../domUtils';
import { isHtmlElement } from '../../../guards';
import { assertDocument, assertWindow, remsToPx } from '../../../utils';
import { assertDefined } from '../../../utils/assertions';
import { cardMarginBottom } from '../constants';
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

/**
 * Calculate positions for the cards according to the location of associated highlights in the document.
 * Positions will be adjusted to the presence of the other cards in cases like multiple highlights in the same line.
 */
const updateStackedCardsPositions = (
  highlightsElements: Highlight[],
  heights: Map<string, number>,
  getHighlightPosition: (highlight: Highlight) => { top: number, bottom: number },
  checkIfHiddenByCollapsedAncestor: (highlight: Highlight) => boolean,
  initialPositions?: Map<string, number>,
  addAditionalMarginForTheFirstCard = false,
  lastVisibleCardPosition = 0,
  lastVisibleCardHeight = 0
) => {
  const positions = initialPositions ? initialPositions : new Map<string, number>();

  for (const [index, highlight] of highlightsElements.entries()) {
    const bottomOffset = getHighlightPosition(highlight).bottom;

    const marginToAdd = index > 0 || addAditionalMarginForTheFirstCard ? remsToPx(cardMarginBottom) : 0;
    const lastVisibleCardBottom = lastVisibleCardPosition + lastVisibleCardHeight;
    const stackedBottomOffset = Math.max(bottomOffset, lastVisibleCardBottom + marginToAdd);
    const heightsForId = heights.get(highlight.id);

    if (heightsForId && !checkIfHiddenByCollapsedAncestor(highlight)) {
      lastVisibleCardPosition = stackedBottomOffset;
      lastVisibleCardHeight = heightsForId;
    }

    positions.set(highlight.id, stackedBottomOffset);
  }

  return positions;
};

/**
 * Calculate how much we have to move cards to adjust their offset so we can align a card for @param highlight
 * with the corresponding highlight in the document.
 */
export const getOffsetToAdjustForHighlightPosition = (
  highlight: Highlight | undefined,
  cardsPositions: Map<string, number>,
  getHighlightPosition: (highlight: Highlight) => { top: number, bottom: number },
  preferEnd: boolean
) => {
  const position = highlight
    ? assertDefined(cardsPositions.get(highlight.id), 'internal function requested postion of unknown highlight')
    : 0;

  const highlightPos = highlight ? getHighlightPosition(highlight) : { top: 0, bottom: 0 };
  const offset = preferEnd ? highlightPos.bottom - 120 : highlightPos.top;

  return position - offset;
};

export const getSelectionDirection = (selection: Selection): 'forward' | 'backward' => {
  if (!selection.anchorNode || !selection.focusNode) {
    return 'forward';
  }

  if (selection.anchorNode === selection.focusNode) {
    return selection.anchorOffset <= selection.focusOffset
      ? 'forward'
      : 'backward';
  }

  const position = selection.anchorNode.compareDocumentPosition(
    selection.focusNode
  );
  const node = assertDocument().getRootNode();

  // eslint-disable-next-line no-bitwise
  return position & node.DOCUMENT_POSITION_FOLLOWING
    ? 'forward'
    : 'backward';
};

export const getPreferEnd = (): boolean => {
  const selection = assertWindow().getSelection();
  const preferEnd = selection && selection.anchorNode && selection.focusNode
    ? getSelectionDirection(selection) === 'forward'
    : false;

  return preferEnd;
};

/**
 * Calculate positions of all cards for @param highlights
 * If @param focusedHighlight is specified then change position of the related card to align it
 * with the corresponding highlight in the document and recalculate positions of all other cards that
 * may be affected by this operation.
 * @param lockFocusedPosition If true, prevents repositioning of the focused card (useful when activating existing cards)
 */
export const updateCardsPositions = (
  focusedHighlight: Highlight | undefined,
  highlights: Highlight[],
  cardsHeights: Map<string, number>,
  getHighlightPosition: (highlight: Highlight) => { top: number, bottom: number },
  checkIfHiddenByCollapsedAncestor: (highlight: Highlight) => boolean,
  lockFocusedPosition = false
) => {
  const cardsPositions = updateStackedCardsPositions(
    highlights,
    cardsHeights,
    getHighlightPosition,
    checkIfHiddenByCollapsedAncestor
  );

  const preferEnd = getPreferEnd();

  // If lockFocusedPosition is true, don't adjust the focused card's position (prevents jumping on activation)
  const offsetToAdjust = lockFocusedPosition
    ? 0
    : getOffsetToAdjustForHighlightPosition(focusedHighlight, cardsPositions, getHighlightPosition, preferEnd);

  if (!focusedHighlight || offsetToAdjust === 0) { return cardsPositions; }

  const focusedHighlightIndex = highlights.findIndex((highlight) => highlight.id === focusedHighlight.id);

  // Start processing the first part of highlights

  const highlightsUpToFocused = highlights.slice(0, focusedHighlightIndex + 1);

  // Reverse an array to start from the focused highlight card, adjust its position and continue adjusting cards above
  const reversedHighlightsUpToFocused = highlightsUpToFocused.reverse();

  for (const [index, highlight] of reversedHighlightsUpToFocused.entries()) {
    const highlightCardTopOffset = cardsPositions.get(highlight.id) as number;
    const adjustedHighlightPosition = highlightCardTopOffset - offsetToAdjust;

    // Adjust position of the card to the calculated offset
    cardsPositions.set(highlight.id, adjustedHighlightPosition);

    // Check if we have to adjust position of a card above and if not then simply break
    const nextHighlight = reversedHighlightsUpToFocused[index + 1] as Highlight | undefined;
    if (nextHighlight) {
      const nextHighlightCardTopOffset = cardsPositions.get(nextHighlight.id) as number;
      const nextHighlightCardHeight = cardsHeights.get(nextHighlight.id) as number;
      const nextHighlightCardBottomOffset = nextHighlightCardTopOffset + nextHighlightCardHeight;

      if (nextHighlightCardBottomOffset <= adjustedHighlightPosition) {
        break;
      }
    }
  }

  // Start processing the second part of highlights

  // Adjusting the position of focused highlight might cause some cards to go up which means that maybe cards
  // that were previously pushed down now have space to align with their highlights.

  const highlightsAfterFocused = highlights.slice(focusedHighlightIndex + 1);

  return updateStackedCardsPositions(
    highlightsAfterFocused,
    cardsHeights,
    getHighlightPosition,
    checkIfHiddenByCollapsedAncestor,
    cardsPositions,
    true,
    cardsPositions.get(focusedHighlight.id) as number,
    cardsHeights.get(focusedHighlight.id) as number
  );
};

export const noopKeyCombinationHandler = (
  allowedContainers: Array<HTMLElement | React.RefObject<HTMLElement>>
) => (activeElement: Element): boolean => {
  const activeElementIsOutsideOfTheAllowedContainer = allowedContainers.every((container) => {
    return isHtmlElement(container)
      ? !container.contains(activeElement)
      : !container.current || !container.current.contains(activeElement);
  });
  if (activeElementIsOutsideOfTheAllowedContainer) { return true; }
  if (activeElement.nodeName === 'TEXTAREA') { return true; }
  return false;
};

export const editCardVisibilityHandler = (state: Map<string, boolean>, action: { type: string; id?: string }) => {
  switch (action.type) {
    case 'SHOW': {
      if (!action.id) return state;
      const newState = new Map(state);
      newState.set(action.id, false);
      return newState;
    }
    case 'HIDE': {
      if (!action.id) return state;
      const updatedState = new Map(state);
      updatedState.set(action.id, true);
      return updatedState;
    }
    default:
      return state;
  }
};
