import { Highlight } from '@openstax/highlighter';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { remsToEms } from '../../../utils';
import { contentTextWidth, sidebarDesktopWidth } from '../../components/constants';
import { isOpenConnector, styleWhenSidebarClosed } from '../../components/utils/sidebar';
import { cardContentMargin, cardMinWindowMargin, cardWidth } from '../constants';

interface Props {
  highlight: Highlight;
  className: string;
}

// tslint:disable-next-line:variable-name
const Card = ({highlight, className}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  return <div className={className} ref={ref}>
    hello {highlight.id}
  </div>;
};

const additionalWidthForCard = (cardWidth + cardContentMargin + cardMinWindowMargin) * 2;

// tslint:disable-next-line:variable-name
const StyledCard = styled(Card)`
  position: absolute;
  left: calc(100% - ((100% - ${contentTextWidth}rem) / 2) + ${cardContentMargin}rem);
  top: ${(props) => props.highlight.elements[0].offsetTop}px;
  height: 100px;
  width: 100px;
  background: green;

  @media (max-width: ${remsToEms(contentTextWidth + sidebarDesktopWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content when the toc is open */
    display: none;

    ${styleWhenSidebarClosed(css`
      display: unset;
    `)}
  }

  ${theme.breakpoints.mobile(css`
    display: unset;
  `)}

  @media (max-width: ${remsToEms(contentTextWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content even with sidebars closed */
    display: none;
  }

`;

export default isOpenConnector(StyledCard);
