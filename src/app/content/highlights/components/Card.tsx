import { Highlight } from '@openstax/highlighter';
import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { AppState } from '../../../types';
import { remsToEms } from '../../../utils';
import { contentTextWidth, searchResultsBarDesktopWidth, sidebarDesktopWidth } from '../../components/constants';
import { styleWhenSidebarClosed } from '../../components/utils/sidebar';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
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

/*
 * putting overflow hidden on a page wrapper that aligns with the window edge would
 * include the sidebar, which would break position: sticky.
 *
 * avoiding using an overflow hidden to hide cards when there is not enough space
 * means being very explicit about hiding them so they don't create a horizontal
 * scrollbar.
 *
 * in this case that means using extensive knowledge about the container widths,
 * which unfortunately means knowledge of all the sidebar widths and their state
 * too.
 *
 * consider making a helper like `styleWhenSidebarClosed` maybe `styleWhenContentWidth`
 * that has a selector to get the relevant stuff.
 */

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

  @media (max-width: ${remsToEms(contentTextWidth + searchResultsBarDesktopWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content when search is open */

    ${(props: {hasQuery: boolean}) => !!props.hasQuery && css`
      display: none;
    `}
  }

  ${theme.breakpoints.mobile(css`
    /* reset desktop breaks */
    display: unset;

    @media (max-width: ${remsToEms(contentTextWidth + additionalWidthForCard)}em) {
      /* the window is too small to show note cards next to content even without sidebars */
      display: none;
    }
  `)}

`;

export default connect(
  (state: AppState) => ({
    hasQuery: !!selectSearch.query(state),
    isOpen: contentSelect.tocOpen(state),
  })
)(StyledCard);
