import { remsToEms } from '../../../utils';
import {
  contentTextWidth,
  searchResultsBarDesktopWidth,
  sidebarDesktopWidth,
} from '../../components/constants';
import {
  cardContentMargin,
  cardMinWindowMargin,
  cardWidth,
} from '../constants';

// Import the CSS file to ensure it's included in the build
import './cardStyles.css';

/**
 * Card positioning and media query breakpoint calculations
 *
 * This file contains the constants and breakpoint values used for highlight card positioning.
 * The actual CSS styles are now in cardStyles.css.
 *
 * NOTE: These constants are exported for testing purposes and backwards compatibility.
 * The CSS file uses hardcoded values that match these calculations.
 */

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
export const OVERLAP_CARD_TOP_OFFSET = 110;
const additionalWidthForCard = (cardWidth + cardContentMargin + cardMinWindowMargin) * 2;
const minimalWidth = contentTextWidth + additionalWidthForCard;
export const minimalWidthForCards = '(max-width: ' + remsToEms(minimalWidth) + 'em)';
export const minimalWidthForCardsWithToc = '(max-width: ' +
  remsToEms(minimalWidth + sidebarDesktopWidth) + 'em)';
export const minimalWidthForCardsWithSearchResults = '(max-width: ' +
  remsToEms(minimalWidth + searchResultsBarDesktopWidth) + 'em)';

