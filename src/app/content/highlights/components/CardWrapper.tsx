import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import { assertDefined } from '../../../utils';
import Card, { getHighlightTopOffset } from './Card';

interface Props {
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

// TODO: Move those to some file with constants
// highlight's offset is in pixels so those are too.
const minimalCardHeight = 34;
const cardPadding = 8;
const cardMarginBottom = 20;

interface HighlightPositionData {
  id: string;
  top: number;
  height: number;
}

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: Props) => {
  const element = React.useRef<HTMLElement>(null);
  const [highlightsData, setHighlightsData] = React.useState<HighlightPositionData[]>([]);

  const onHeightChange = (id: string, height: number) => {
    const position = highlightsData.find((data) => data.id === id);
    if (!position) { return; }

    if (height !== position.height) {
      const updated = highlightsData.map((data) => data.id === id ? { ...data, height } : data);
      setHighlightsData(updated);
      updatePositions(updated);
    }
  };

  const onFocus = (id: string) => {
    const highlight = highlights.find((search) => search.id === id);
    const position = highlightsData.find((data) => data.id === id);
    if (!position || !highlight) { return; }

    const topOffset = assertDefined(
      getHighlightTopOffset(container, highlight),
      `Couldn't get top offset for highlights`
    );

    if (position.top > topOffset) {
      element.current!.style.top = `-${position.top - topOffset}px`;
    }
  };

  const onBlur = () => {
    element.current!.style.top = '0';
  };

  const updatePositions = React.useCallback((hlData?: HighlightPositionData[]) => {
    const data: HighlightPositionData[] = [];
    for (const [index, highlight] of highlights.entries()) {
      const topOffset = assertDefined(
        getHighlightTopOffset(container, highlight),
        `Couldn't get top offset for highlights`
      );

      const prevHighlight = hlData ? hlData[index - 1] : data[index - 1];
      const prevHighlightHeight = prevHighlight
        ? prevHighlight.height : 0;

      let stackedTopOffset = prevHighlight ? prevHighlight.top : 0;

      if ((topOffset - prevHighlightHeight) < stackedTopOffset) {
        stackedTopOffset = stackedTopOffset
          + prevHighlightHeight
          + (index > 0 ? cardMarginBottom : 0)
          + (cardPadding * 2);
      } else {
        stackedTopOffset = topOffset;
      }

      data.push({
        // Default height is min height for highlight. This height can be updated after render.
        height: minimalCardHeight,
        id: highlight.id,
        top: stackedTopOffset,
      });

      setHighlightsData(data);
    }
  }, [highlights, container]);

  // Set initial positions for highlights
  React.useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  return <div className={className} ref={element}>
    {highlights.map((highlight, index) => <Card
      highlighter={highlighter}
      highlight={highlight}
      key={highlight.id}
      container={container}
      topOffset={(highlightsData[index] && highlightsData[index].top) || 0}
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
