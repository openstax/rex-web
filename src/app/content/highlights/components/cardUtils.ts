import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum, HighlightUpdateColorEnum, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { HTMLElement, } from '@openstax/types/lib.dom';
import { findElementSelfOrParent } from '../../../domUtils';
import { assertWindow, remsToPx } from '../../../utils';
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
const updateStackedCardsPostions = (
  highlightsElements: Highlight[],
  heights: Map<string, number>,
  getHighlightPosition: (highlight: Highlight) => { top: number, bottom: number },
  initialPositions?: Map<string, number>,
  addMarginBottomToTheFirstCard = false,
  lastVisibleCardPosition = 0,
  lastVisibleCardHeight = 0
) => {
  const positions = initialPositions ? initialPositions : new Map<string, number>();

  for (const [index, highlight] of highlightsElements.entries()) {
    const topOffset = getHighlightPosition(highlight).top;

    const marginToAdd = index > 0 || addMarginBottomToTheFirstCard ? remsToPx(cardMarginBottom) : 0;
    const lastVisibleCardBottom = lastVisibleCardPosition + lastVisibleCardHeight;
    const stackedTopOffset = Math.max(topOffset, lastVisibleCardBottom + marginToAdd);

    if (heights.get(highlight.id)) {
      lastVisibleCardPosition = stackedTopOffset;
      lastVisibleCardHeight = heights.get(highlight.id)!;
    }

    positions.set(highlight.id, stackedTopOffset);
  }

  return positions;
};

/**
 * Calculate how much we have to move cards to adjust their offset so we can align a card for @param highlight
 * with the corresponding highlight in the document.
 */
const getOffsetToAdjustForHighlightPosition = (
  highlight: Highlight | undefined,
  cardsPositions: Map<string, number>,
  getHighlightPosition: (highlight: Highlight) => { top: number, bottom: number }
) => {
  const position = highlight
    ? cardsPositions.get(highlight.id) || 0
    : 0;

  const topOffsetFocused = highlight && position
    ? getHighlightPosition(highlight).top
    : 0;

  return position - topOffsetFocused;
};

/**
 * Change position of a card for @param highlight to align it with the corresponding highlight in the document
 * and recalculate positions of other cards that may be affected by this operation.
 */
export const updateCardsPositions = (
  focusedHighlight: Highlight | undefined,
  highlights: Highlight[],
  cardsHeights: Map<string, number>,
  getHighlightPosition: (highlight: Highlight) => { top: number, bottom: number }
) => {
  const cardsPositions = updateStackedCardsPostions(highlights, cardsHeights, getHighlightPosition);

  const offsetToAdjust = getOffsetToAdjustForHighlightPosition(focusedHighlight, cardsPositions, getHighlightPosition);

  if (!focusedHighlight || offsetToAdjust === 0) { return cardsPositions; }

  const focusedHighlightIndex = focusedHighlight
    ? highlights.findIndex((highlight) => highlight.id === focusedHighlight.id)
    : -1;

  // Start processing the first part of highlights

  const highlightsUpToFocused = focusedHighlightIndex > 0 ? highlights.slice(0, focusedHighlightIndex + 1) : [];

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

  const highlightsAfterFocused = focusedHighlightIndex > 0 ? highlights.slice(focusedHighlightIndex + 1) : [];

  return updateStackedCardsPostions(
    highlightsAfterFocused,
    cardsHeights,
    getHighlightPosition,
    cardsPositions,
    true,
    cardsPositions.get(focusedHighlight.id) as number,
    cardsHeights.get(focusedHighlight.id) as number
  );
};
