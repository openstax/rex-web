import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components';
import { scrollIntoView } from '../../../domUtils';
import theme from '../../../theme';
import { assertDefined, assertWindow } from '../../../utils';
import { cardMarginBottom } from '../constants';
import Card, { getHighlightTopOffset, mediaQueryBreakToStopDisplaingAllCards } from './Card';

interface Props {
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

const displayAllCardsMediaQuery = `(max-width: ${mediaQueryBreakToStopDisplaingAllCards})`;

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: Props) => {
  const displayAllCards = !assertWindow().matchMedia(displayAllCardsMediaQuery).matches;

  const element = React.useRef<HTMLElement>(null);
  const [cardsPositions, setCardsPositions] = React.useState<Map<string, number>>(new Map());
  const [cardsHeights, setCardsHeights] = React.useState<Map<string, number>>(new Map());

  const onHeightChange = (id: string, ref: React.RefObject<HTMLElement>) => {
    if (!displayAllCards) { return; }

    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((data) => new Map(data.set(id, height === null ? 0 : height)));
    }
  };

  const onFocus = (id: string) => {
    if (!displayAllCards) { return; }

    const highlight = highlights.find((search) => search.id === id);
    const position = cardsPositions.get(id);
    if (typeof position !== 'number' || !highlight) { return; }

    const topOffset = assertDefined(
      getHighlightTopOffset(container, highlight),
      `Couldn't get top offset for highlights`
    );

    if (position > topOffset) {
      element.current!.style.top = `-${position - topOffset}px`;
    }

    scrollIntoView(highlight.elements[0] as HTMLElement);
  };

  const onBlur = () => {
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

      let stackedTopOffset = lastVisibleCardPosition;

      if ((topOffset - lastVisibleCardPosition) < stackedTopOffset) {
        stackedTopOffset = stackedTopOffset
          + lastVisibleCardHeight
          + (index > 0 ? (cardMarginBottom * 10) : 0); // * 10 because constants are in pixels and we need rems.
      } else {
        stackedTopOffset = topOffset;
      }

      if (cardsHeights.get(highlight.id)) {
        lastVisibleCardPosition = stackedTopOffset;
        lastVisibleCardHeight = cardsHeights.get(highlight.id)!;
      }

      newPositions.set(highlight.id, stackedTopOffset);

      setCardsPositions(newPositions);
    }
  }, [highlights, cardsHeights, container]);

  React.useEffect(() => {
    if (displayAllCards) {
      updatePositions();
    } else {
      onBlur();
    }
  }, [updatePositions, displayAllCards]);

  return <div className={className} ref={element}>
    {highlights.map((highlight) => <Card
      highlighter={highlighter}
      highlight={highlight}
      key={highlight.id}
      container={container}
      topOffset={cardsPositions.get(highlight.id) || 0}
      onHeightChange={onHeightChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />)}
  </div>;
};

export default styled(Wrapper)`
  position: relative;
  overflow: visible;
  z-index: ${theme.zIndex.highlightInlineCard};
  top: 0;
  transition: all 0.3s;
`;
