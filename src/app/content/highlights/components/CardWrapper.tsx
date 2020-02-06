import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import { assertDefined } from '../../../utils';
import { cardMarginBottom } from '../constants';
import Card, { getHighlightTopOffset } from './Card';

interface Props {
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: Props) => {
  const element = React.useRef<HTMLElement>(null);
  const [cardsPositions, setCardsPositions] = React.useState<Map<string, number>>(new Map());
  const [cardsHeights, setCardsHeights] = React.useState<Map<string, number>>(new Map());

  const onHeightChange = (id: string, height: number) => {
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((data) => new Map(data.set(id, height)));
    }
  };

  const onFocus = (id: string) => {
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
  };

  const onBlur = () => {
    element.current!.style.top = '0';
  };

  const updatePositions = React.useCallback(() => {
    const newPositions: Map<string, number> = new Map();

    let lastVisibleHighlightPosition: number = 0;
    let lastVisibleHighlightHeight: number = 0;

    for (const [index, highlight] of highlights.entries()) {
      const topOffset = assertDefined(
        getHighlightTopOffset(container, highlight),
        `Couldn't get top offset for highlights`
      );

      let stackedTopOffset = lastVisibleHighlightPosition;

      if ((topOffset - lastVisibleHighlightPosition) < stackedTopOffset) {
        stackedTopOffset = stackedTopOffset
          + lastVisibleHighlightHeight
          + (index > 0 ? (cardMarginBottom * 10) : 0); // * 10 because constants are in pixels and we need rems.
      } else {
        stackedTopOffset = topOffset;
      }

      if (cardsHeights.get(highlight.id)) {
        lastVisibleHighlightPosition = stackedTopOffset;
        lastVisibleHighlightHeight = cardsHeights.get(highlight.id)!;
      }

      newPositions.set(highlight.id, stackedTopOffset);

      setCardsPositions(newPositions);
    }
  }, [highlights, cardsHeights, container]);

  React.useEffect(() => {
    updatePositions();
  }, [updatePositions]);

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
