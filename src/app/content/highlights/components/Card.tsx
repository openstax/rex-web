import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { AppState } from '../../../types';
import { remsToEms } from '../../../utils';
import { contentTextWidth, searchResultsBarDesktopWidth, sidebarDesktopWidth } from '../../components/constants';
import { styleWhenSidebarClosed } from '../../components/utils/sidebar';
import * as selectHighlights from '../../highlights/selectors';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { cardContentMargin, cardFocusedContentMargin, cardMinWindowMargin, cardWidth } from '../constants';

interface Props {
  isFocused: boolean;
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

const overlapDisplay = css`
  ${(props: Props) => !!props.isFocused && css`
    left: unset;
    right: ${cardMinWindowMargin}rem;
    top: ${() => {
      const lastElement = props.highlight.elements[props.highlight.elements.length - 1] as HTMLElement;
      const bottomOffset = lastElement.offsetTop + lastElement.offsetHeight;

      return bottomOffset;
    }}px;
  `}
  ${(props: Props) => !props.isFocused && css`
    display: none;
  `}
`;

const rightSideDisplay = css`
  left: calc(100% - ((100% - ${contentTextWidth}rem) / 2) + ${cardContentMargin}rem);
  right: unset;
  top: ${(props: Props) => (props.highlight.elements[0] as HTMLElement).offsetTop}px;
  ${(props: Props) => !!props.isFocused && css`
    left: calc(100% - ((100% - ${contentTextWidth}rem) / 2) + ${cardFocusedContentMargin}rem);
  `}
  ${(props: Props) => !props.isFocused && css`
    /* temporary simplification */
    display: none;
  `}
`;

// tslint:disable-next-line:variable-name
const StyledCard = styled(Card)`
  position: absolute;
  height: 100px;
  width: 100px;
  background: green;
  ${rightSideDisplay}

  @media (max-width: ${remsToEms(contentTextWidth + searchResultsBarDesktopWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content when search is open */
    ${rightSideDisplay}
    ${(props: {hasQuery: boolean}) => !!props.hasQuery && overlapDisplay}
  }

  @media (max-width: ${remsToEms(contentTextWidth + sidebarDesktopWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content when the toc is open */
    ${overlapDisplay}
    ${styleWhenSidebarClosed(rightSideDisplay)}
  }

  ${theme.breakpoints.mobile(css`
    /* reset desktop breaks */
    ${rightSideDisplay}

    @media (max-width: ${remsToEms(contentTextWidth + additionalWidthForCard)}em) {
      /* the window is too small to show note cards next to content even without sidebars */
      display: none;
    }
  `)}

`;

export default connect(
  (state: AppState, ownProps: {highlight: Highlight}) => ({
    hasQuery: !!selectSearch.query(state),
    isFocused: selectHighlights.focused(state) === ownProps.highlight.id,
    isOpen: contentSelect.tocOpen(state),
  })
)(StyledCard);
