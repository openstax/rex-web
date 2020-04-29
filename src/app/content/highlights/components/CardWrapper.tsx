import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { scrollIntoView } from '../../../domUtils';
import { AppState } from '../../../types';
import { assertDefined, assertNotNull, remsToPx } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { cardMarginBottom } from '../constants';
import Card from './Card';
import { mainWrapperStyles } from './cardStyles';
import { getHighlightTopOffset } from './cardUtils';

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
  const [topOffsets, setTopOffsets] = React.useState<Map<string, number>>(new Map());

  const onHeightChange = (id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height === null ? 0 : height));
    }
  };

  const onFocus = (highlight: Highlight) => {
    const position = assertDefined(
      cardsPositions.get(highlight.id),
      'position has to be defined before focusing a card');

    const topOffset = getTopOffsetForHighlight(highlight);

    if (position > topOffset) {
      assertNotNull(element.current, 'element.current can\'t be null')
        .style.transform = `translateY(-${position - topOffset}px)`;
    }

    // This will be undefined for pendingHighlight
    if (highlight.elements[0]) {
      scrollIntoView(highlight.elements[0] as HTMLElement);
    }
  };

  const resetTopOffset = () => {
    assertNotNull(element.current, 'element.current can\'t be null').style.transform = '';
  };

  const getTopOffsetForHighlight = (highlight: Highlight) => {
    if (topOffsets.has(highlight.id)) {
      return assertDefined(topOffsets.get(highlight.id), 'this has to be defined');
    } else {
      const offset = assertDefined(
        getHighlightTopOffset(container, highlight),
        `Couldn't get top offset for highlight with an id: ${highlight.id}`
      );
      setTopOffsets((state) => new Map(state).set(highlight.id, offset));
      return offset;
    }
  };

  React.useEffect(() => {
    const newPositions: Map<string, number> = new Map();

    let lastVisibleCardPosition = 0;
    let lastVisibleCardHeight = 0;

    for (const [index, highlight] of highlights.entries()) {
      const topOffset = getTopOffsetForHighlight(highlight);

      const stackedTopOffset = Math.max(topOffset, lastVisibleCardPosition
        + lastVisibleCardHeight
        + (index > 0 ? remsToPx(cardMarginBottom) : 0));

      if (cardsHeights.get(highlight.id)) {
        lastVisibleCardPosition = stackedTopOffset;
        lastVisibleCardHeight = cardsHeights.get(highlight.id)!;
      }

      newPositions.set(highlight.id, stackedTopOffset);
    }

    setCardsPositions(newPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights, cardsHeights]);

  return highlights.length
    ? <div className={className} ref={element}>
      {highlights.map((highlight, index) => <Card
        highlighter={highlighter}
        highlight={highlight}
        key={highlight.id}
        container={container}
        topOffset={cardsPositions.get(highlight.id)}
        resetTopOffset={resetTopOffset}
        onHeightChange={(ref: React.RefObject<HTMLElement>) => onHeightChange(highlight.id, ref)}
        onFocus={() => onFocus(highlight)}
        zIndex={highlights.length - index}
      />)}
    </div>
    : null;
};

export default connect(
  (state: AppState) => ({
    hasQuery: !!selectSearch.query(state),
    isTocOpen: contentSelect.tocOpen(state),
  })
)(styled(Wrapper)`
  ${mainWrapperStyles}
`);
