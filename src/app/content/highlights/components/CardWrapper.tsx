import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import { scrollIntoView } from '../../../domUtils';
import { AppState } from '../../../types';
import { assertDefined, remsToPx } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { cardMarginBottom } from '../constants';
import { focused } from '../selectors';
import Card from './Card';
import { mainWrapperStyles } from './cardStyles';
import { getHighlightOffset } from './cardUtils';

export interface WrapperProps {
  hasQuery: boolean;
  isTocOpen: boolean;
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: WrapperProps) => {
  const element = React.useRef<HTMLElement>(null);
  const [cardsPositions, setCardsPositions] = React.useState<Map<string, number>>(new Map());
  const [cardsHeights, setCardsHeights] = React.useState<Map<string, number>>(new Map());
  const [offsets, setOffsets] = React.useState<Map<string, { top: number, bottom: number }>>(new Map());
  const focusedId = useSelector(focused);
  const focusedHighlight = React.useMemo(
    () => highlights.find((highlight) => highlight.id === focusedId),
    [focusedId, highlights]);
  const prevFocusedHighlightId = React.useRef(focusedId);

  const onHeightChange = (id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height === null ? 0 : height));
    }
  };

  const getOffsetsForHighlight = (highlight: Highlight) => {
    if (offsets.has(highlight.id)) {
      return assertDefined(offsets.get(highlight.id), 'this has to be defined');
    } else {
      const newOffsets = assertDefined(
        getHighlightOffset(container, highlight),
        `Couldn't get offsets for highlight with an id: ${highlight.id}`
      );
      setOffsets((state) => new Map(state).set(highlight.id, newOffsets));
      return newOffsets;
    }
  };

  const updateCardsPositions = React.useCallback(() => {
    const newPositions: Map<string, number> = new Map();

    let lastVisibleCardPosition = 0;
    let lastVisibleCardHeight = 0;

    for (const [index, highlight] of highlights.entries()) {
      const topOffset = getOffsetsForHighlight(highlight).top;

      const stackedTopOffset = Math.max(topOffset, lastVisibleCardPosition
        + lastVisibleCardHeight
        + (index > 0 ? remsToPx(cardMarginBottom) : 0));

      if (cardsHeights.get(highlight.id)) {
        lastVisibleCardPosition = stackedTopOffset;
        lastVisibleCardHeight = cardsHeights.get(highlight.id)!;
      }

      newPositions.set(highlight.id, stackedTopOffset);
    }

    const focusedPosition = focusedHighlight
      ? cardsPositions.get(focusedHighlight.id) || 0
      : 0;

    const topOffsetFocused = focusedHighlight && focusedPosition
      ? getOffsetsForHighlight(focusedHighlight).top
      : 0;

    const focusedHighlightIndex = focusedHighlight
      ? highlights.findIndex((highlight) => highlight.id === focusedHighlight.id)
      : -1;

    const highlightsUpToFocused = focusedHighlightIndex > 0 ? highlights.slice(0, focusedHighlightIndex + 1) : [];
    const highlightsAfterFocused = focusedHighlightIndex > 0 ? highlights.slice(focusedHighlightIndex + 1) : [];

    const reversedHighlightsUpToFocused = highlightsUpToFocused.reverse();

    const offsetToAdjust = focusedPosition - topOffsetFocused;

    if (offsetToAdjust > 0) {
      for (const [index, highlight] of reversedHighlightsUpToFocused.entries()) {

        const highlightTopOffset = newPositions.get(highlight.id) as number;
        const adjustedHighlightPosition = highlightTopOffset - offsetToAdjust;

        newPositions.set(highlight.id, adjustedHighlightPosition);

        const nextHighlight = reversedHighlightsUpToFocused[index + 1] as Highlight | undefined;
        if (nextHighlight) {
          const nextHighlightTopOffset = newPositions.get(nextHighlight.id) as number;
          const nextHighlightHeight = cardsHeights.get(nextHighlight.id) as number;
          const nextHighlightBottomOffset = nextHighlightTopOffset + nextHighlightHeight;

          if (nextHighlightBottomOffset <= adjustedHighlightPosition) {
            break;
          }
        }

      }

      let lastVisibleCardPosition = 0;
      let lastVisibleCardHeight = 0;

      for (const [index, highlight] of highlightsAfterFocused.entries()) {
        const topOffset = getOffsetsForHighlight(highlight).top;

        const stackedTopOffset = Math.max(topOffset, lastVisibleCardPosition
          + lastVisibleCardHeight
          + (index > 0 ? remsToPx(cardMarginBottom) : 0));

        if (cardsHeights.get(highlight.id)) {
          lastVisibleCardPosition = stackedTopOffset;
          lastVisibleCardHeight = cardsHeights.get(highlight.id)!;
        }

        newPositions.set(highlight.id, stackedTopOffset);
      }
    }

    setCardsPositions(newPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights, cardsHeights, focusedHighlight]);

  React.useEffect(() => {
    if (!focusedHighlight && element.current) {
      element.current.style.transform = '';
    }
  }, [focusedHighlight]);

  React.useEffect(updateCardsPositions, [updateCardsPositions]);

  React.useEffect(() => {
    if (!focusedHighlight) { return; }
    const position = cardsPositions.get(focusedHighlight.id);
    // position may be undefined in case of changing a page when highlight is focused
    // because highlights will be already cleared and this function will try to run
    // before page changes.
    if (!position) { return; }
    // const topOffset = getOffsetsForHighlight(focusedHighlight).top;

    // if (position > topOffset) {
    //   assertNotNull(element.current, 'element.current can\'t be null')
    //     .style.transform = `translateY(-${position - topOffset}px)`;
    // }

    // Check for prevFocusedHighlightId.current is required so we do not scroll to the
    // focused highlight after user switches between the browser tabs - in this case
    // highlights are refetched and it trigers cardPositions to be updated since reference
    // to the highlights or highlights' data has changed.
    // focusedHighlight.elements[0] will be undefined for pendingHighlight
    if (focusedHighlight.id !== prevFocusedHighlightId.current && focusedHighlight.elements[0]) {
      prevFocusedHighlightId.current = focusedHighlight.id;
      scrollIntoView(focusedHighlight.elements[0] as HTMLElement);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedHighlight, cardsPositions]);

  return highlights.length
    ? <div className={className} ref={element}>
      {highlights.map((highlight, index) => (
        <Card
          highlighter={highlighter}
          highlight={highlight}
          key={highlight.id}
          container={container}
          topOffset={cardsPositions.get(highlight.id)}
          highlightOffsets={offsets.get(highlight.id)}
          onHeightChange={(ref: React.RefObject<HTMLElement>) => onHeightChange(highlight.id, ref)}
          zIndex={highlights.length - index}
        />
      ))}
    </div>
    : null;
};

export default connect(
  (state: AppState) => ({
    // These are used in the cardStyles.ts
    hasQuery: !!selectSearch.query(state),
    isTocOpen: contentSelect.tocOpen(state),
  })
)(styled(Wrapper)`
  ${mainWrapperStyles}
`);
