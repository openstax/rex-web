import { Highlight } from '@openstax/highlighter';
import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Card from './Card';

interface Props {
  highlights: Highlight[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className}: Props) => <div className={className}>
  {highlights
    .map((highlight) => <Card highlight={highlight} key={highlight.id} />)
  }
</div>;

export default styled(Wrapper)`
  position: relative;
  overflow: visible;
  z-index: ${theme.zIndex.toolbar - 1};
`;
