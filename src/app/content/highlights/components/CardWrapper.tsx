import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { scrollIntoView } from '../../../domUtils';
import { AppState } from '../../../types';
import { assertDefined, remsToPx } from '../../../utils';
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

  const onHeightChange = (id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height === null ? 0 : height));
    }
  };

  const onFocus = (highlight: Highlight) => {
    const position = cardsPositions.get(highlight.id);
    if (typeof position !== 'number') { return; }

    const topOffset = assertDefined(
      getHighlightTopOffset(container, highlight),
      `Couldn't get top offset for highlights`
    );

    if (position > topOffset) {
      element.current!.style.top = `-${position - topOffset}px`;
    }

    // This will be undefined for pendingHighlight
    if (highlight.elements[0]) {
      scrollIntoView(highlight.elements[0] as HTMLElement);
    }
  };

  const resetTopOffset = () => {
    element.current!.style.top = '0';
  };

  const updatePositions = React.useCallback(() => {
    const newPositions: Map<string, number> = new Map();

    let lastVisibleCardPosition: number = 0;
    let lastVisibleCardHeight: number = 0;

    for (const [index, highlight] of highlights.entries()) {
      const topOffset = assertDefined(
        getHighlightTopOffset(container, highlight),
        `Couldn't get top offset for highlights`
      );

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
  }, [highlights, cardsHeights, container]);

  React.useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  return highlights.length
    ? <div className={className} ref={element}>
      {highlights.map((highlight) => <Card
        highlighter={highlighter}
        highlight={highlight}
        key={highlight.id}
        container={container}
        topOffset={cardsPositions.get(highlight.id)}
        onHeightChange={(ref: React.RefObject<HTMLElement>) => onHeightChange(highlight.id, ref)}
        onFocus={() => onFocus(highlight)}
        onBlur={resetTopOffset}
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
