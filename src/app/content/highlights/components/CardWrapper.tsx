import Highlighter, { Highlight } from '@openstax/highlighter';
import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Card from './Card';

interface Props {
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: Props) => <div className={className}>
  {highlights.map((highlight) => <Card
    highlighter={highlighter}
    highlight={highlight}
    key={highlight.id}
    container={container}
  />)}
</div>;

export default styled(Wrapper)`
  position: relative;
  overflow: visible;
  z-index: ${theme.zIndex.highlightInlineCard};
`;
