import { css, keyframes } from 'styled-components';
import { DropdownList } from '../../../components/Dropdown';
import theme from '../../../theme';
import { remsToEms } from '../../../utils';
import {
  contentTextWidth,
  searchResultsBarDesktopWidth,
  sidebarDesktopWidth,
} from '../../components/constants';
import { disablePrint } from '../../components/utils/disablePrint';
import { highlightStyles } from '../../constants';
import {
  cardContentMargin,
  cardFocusedContentMargin,
  cardMinWindowMargin,
  cardPadding,
  cardWidth,
} from '../constants';
import { HighlightData } from '../types';
import { CardProps } from './Card';
import { getHighlightBottomOffset, getHighlightTopOffset } from './cardUtils';
import { WrapperProps } from './CardWrapper';
import { cardBorder } from './style';

export const getHighlightViewportTop = (highlight: CardProps['highlight']): number | undefined => {
  if (!highlight.range || !highlight.range.getBoundingClientRect) {
    return undefined;
  }
  return highlight.range.getBoundingClientRect().top;
};

export const getHighlightViewportBottom = (highlight: CardProps['highlight']): number | undefined => {
  if (!highlight.range || !highlight.range.getBoundingClientRect) {
    return undefined;
  }
  return highlight.range.getBoundingClientRect().bottom;
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
const OVERLAP_CARD_TOP_OFFSET = 110;
const additionalWidthForCard = (cardWidth + cardContentMargin + cardMinWindowMargin) * 2;
const minimalWidth = contentTextWidth + additionalWidthForCard;
export const minimalWidthForCards = '(max-width: ' + remsToEms(minimalWidth) + 'em)';
export const minimalWidthForCardsWithToc = '(max-width: ' +
  remsToEms(minimalWidth + sidebarDesktopWidth) + 'em)';
export const minimalWidthForCardsWithSearchResults = '(max-width: ' +
  remsToEms(minimalWidth + searchResultsBarDesktopWidth) + 'em)';

const overlapDisplay = css`
  ${(props: CardProps) => !!props.isActive && css`
    left: calc(75vw - (${contentTextWidth}rem / 2) + ${cardFocusedContentMargin}rem);
    right: unset;
    top: ${props.highlightOffsets
      ? (props.preferEnd
          ? props.highlightOffsets.bottom
          : props.highlightOffsets.top - OVERLAP_CARD_TOP_OFFSET)
      : (props.preferEnd
          ? getHighlightBottomOffset(props.container, props.highlight)
          : getHighlightTopOffset(props.container, props.highlight))}px;
  `}
  ${(props: CardProps) => !props.isActive && css`
    display: none;
  `}
`;

const rightSideDisplay = css`
  left: calc(50% + (${contentTextWidth}rem / 2) + ${cardContentMargin}rem);
  right: unset;
  top: ${(props: CardProps) => `${props.topOffset || getHighlightBottomOffset(props.container, props.highlight)}px;`}
  ${(props: CardProps) => !!props.isActive && css`
    left: calc(50% + (${contentTextWidth}rem / 2) + ${cardFocusedContentMargin}rem);
  `}
`;

const touchScreenDisplay = css`
  ${(props: CardProps) => !!props.isActive && css`
    left: 0;
    right: 0;
    bottom: 0;
    top: unset;
    position: fixed;
    padding: 0;
  `}
  ${(props: CardProps) => !props.isActive && css`
    display: none;
  `}
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

const fadeInAnimation = css`
  animation: ${600}ms ${fadeIn} ease-out;
`;

const fixedRightSideDisplay = css`
  position: fixed;
  left: calc(50vw + (${contentTextWidth}rem / 2) + ${cardContentMargin}rem);
  right: unset;
  top: ${(props: CardProps) => {
    const viewportTop = getHighlightViewportTop(props.highlight);
    return viewportTop !== undefined ? `${viewportTop}px` : '0px';
  }};
  ${(props: CardProps) => !!props.isActive && css`
    left: calc(50vw + (${contentTextWidth}rem / 2) + ${cardFocusedContentMargin}rem);
  `}
`;

const fixedOverlapDisplay = css`
  position: fixed;
  ${(props: CardProps) => !!props.isActive && css`
    left: max(1rem, calc(75vw - (${contentTextWidth}rem / 2) + ${cardFocusedContentMargin}rem));
    right: unset;
    top: ${() => {
      // For overlap, position near top of viewport
      return '120px';
    }};
    max-width: calc(100vw - 2rem);
  `}
  ${(props: CardProps) => !props.isActive && css`
    display: none;
  `}
`;

export const mainCardStyles = css`
  ${(props: CardProps) => props.isHidden
    ? 'visibility: hidden;'
    : 'visibility: visible;'}
  ${fadeInAnimation}
  display: block;
  position: absolute;
  padding: ${cardPadding}rem;
  ${cardBorder}
  ${rightSideDisplay}
  ${disablePrint}

  z-index: ${(props: CardProps) => props.zIndex};
  transition: opacity 0.3s, top 0.3s, left 0.3s;

  ${DropdownList} {
    z-index: 1;
  }

  ${(props: {data: HighlightData}) => {
    const data = props.data;

    if (!data?.color) {
      return null;
    }

    const style = highlightStyles.find((search) => search.label === data.color);

    return css`
      ::before {
        content: ' ';
        border-radius: 0.4rem 0 0 0.4rem;
        position: absolute;
        top: 0;
        left: 0
        bottom: 0;
        width: ${cardPadding / 2}rem;
        background-color: ${style?.focused};
      }
      ${theme.breakpoints.touchDeviceQuery(css`
        ::before {
          border-radius: 0.4rem 0.4rem 0 0;
          right: 0;
          bottom: unset;
          width: unset;
          height: ${cardPadding / 2}rem;
        }
     `)}
    `;
  }}

  /* in this media query if isTocOpen is null or truthy it means that toc is open */
  ${(props: CardProps) => (props.isTocOpen === null || props.isTocOpen) && css`
    @media ${minimalWidthForCardsWithToc} {
      /* the window is too small to show note cards next to content when the toc is open */
      animation: none;
      ${overlapDisplay}
    }
  `}

  /*
    not sure if this breakpoint is necessary, because search results have same width
    (from the visual perspective, because values are different)
  */
  ${(props: CardProps) => props.hasQuery && css`
    @media ${minimalWidthForCardsWithSearchResults} {
      /* the window is too small to show note cards next to content when search is open */
      animation: none;
      ${overlapDisplay}
    }
  `}

  @media ${minimalWidthForCards} {
    /* the window is too small to show note cards next to content even without sidebars */
    animation: none;
    ${overlapDisplay}
  }

  ${theme.breakpoints.touchDeviceQuery(css`
    animation: none;
    ${touchScreenDisplay}
  `)}
`;

// TODO: hack to get it rendering, need to figure out a better way to position these
export const portalCardStyles = css`
  ${(props: CardProps) => props.isHidden
    ? 'visibility: hidden;'
    : 'visibility: visible;'}
  font-size: 1.6rem;
  line-height: normal;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  text-transform: none;
  letter-spacing: normal;
  ${fadeInAnimation}
  display: block;
  padding: ${cardPadding}rem;
  ${cardBorder}
  ${fixedRightSideDisplay}
  ${disablePrint}

  z-index: ${(props: CardProps) => props.zIndex};

  ${DropdownList} {
    z-index: 1;
  }

  ${(props: {data: HighlightData}) => {
    const data = props.data;

    if (!data?.color) {
      return null;
    }

    const style = highlightStyles.find((search) => search.label === data.color);

    return css`
      ::before {
        content: ' ';
        border-radius: 0.4rem 0 0 0.4rem;
        position: absolute;
        top: 0;
        left: 0
        bottom: 0;
        width: ${cardPadding / 2}rem;
        background-color: ${style?.focused};
      }
      ${theme.breakpoints.touchDeviceQuery(css`
        ::before {
          border-radius: 0.4rem 0.4rem 0 0;
          right: 0;
          bottom: unset;
          width: unset;
          height: ${cardPadding / 2}rem;
        }
     `)}
    `;
  }}

  /* in this media query if isTocOpen is null or truthy it means that toc is open */
  ${(props: CardProps) => (props.isTocOpen === null || props.isTocOpen) && css`
    @media ${minimalWidthForCardsWithToc} {
      /* the window is too small to show note cards next to content when the toc is open */
      animation: none;
      ${fixedOverlapDisplay}
    }
  `}

  ${(props: CardProps) => props.hasQuery && css`
    @media ${minimalWidthForCardsWithSearchResults} {
      /* the window is too small to show note cards next to content when search is open */
      animation: none;
      ${fixedOverlapDisplay}
    }
  `}

  @media ${minimalWidthForCards} {
    /* the window is too small to show note cards next to content even without sidebars */
    animation: none;
    ${fixedOverlapDisplay}
  }

  ${theme.breakpoints.touchDeviceQuery(css`
    animation: none;
    ${touchScreenDisplay}
  `)}
`;

export const mainWrapperStyles = css`
  position: relative;
  overflow: visible;
  z-index: ${theme.zIndex.highlightInlineCard};
  transform: auto;
  transition: transform 0.3s;

  ${(props: WrapperProps) => (props.isTocOpen === null || props.isTocOpen) && css`
    @media ${minimalWidthForCardsWithToc} {
      /* override js inline styles for display of all cards while using overlap display */
      transform: none !important;
    }
  `}

  ${(props: WrapperProps) => props.hasQuery && css`
    @media (max-width: ${minimalWidthForCardsWithSearchResults}em) {
      /* override js inline styles for display of all cards while using overlap display */
      transform: none !important;
    }
  `}

  @media ${minimalWidthForCards} {
    /* override js inline styles for display of all cards while using overlap display */
    transform: none !important;
  }

  ${theme.breakpoints.mobile(css`
    /* override js inline styles for display of all cards while using overlap display */
    transform: none !important;
  `)}
`;
