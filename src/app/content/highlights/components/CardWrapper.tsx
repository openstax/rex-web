import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import { scrollIntoView } from '../../../domUtils';
import { AppState } from '../../../types';
import { assertDefined } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { focused } from '../selectors';
import Card from './Card';
import { mainWrapperStyles } from './cardStyles';
import { getHighlightOffset, updateCardsPositions } from './cardUtils';

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

  const onHeightChange = React.useCallback((id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height === null ? 0 : height));
    }
  }, [cardsHeights]);

  const getOffsetsForHighlight = React.useCallback((highlight: Highlight) => {
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
  }, [container, offsets]);

  React.useEffect(() => {
    const positions = updateCardsPositions(focusedHighlight, highlights, cardsHeights, getOffsetsForHighlight);
    setCardsPositions(positions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights, cardsHeights, focusedHighlight]);

  // Scroll into view of highlight when user focuses it
  React.useEffect(() => {
    if (!focusedHighlight) { return; }

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
