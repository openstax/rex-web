// based on https://sketchviewer.com/sketches/59766aabb57e8900114c89ce/latest/
import {
  color,
  desktopBreak,
  mobileBreak,
  mobileMediumBreak,
  mobileSmallBreak,
  padding,
  zIndex,
} from './themeData';

export type { ColorSet } from './themeData';

/**
 * CSS class name for visually hiding content while keeping it accessible to screen readers.
 * Apply this class to elements that should be hidden visually but remain in the accessibility tree.
 *
 * @example
 * <span className={hiddenButAccessibleClass}>Screen reader only text</span>
 */
export const hiddenButAccessibleClass = 'hidden-but-accessible';
// Browser default outline for focus items per
// https://css-tricks.com/copy-the-browsers-native-focus-styles/
export const defaultFocusOutline = `
  outline: 0.2rem auto Highlight;
  outline: 0.2rem auto -webkit-focus-ring-color;
`;

const mobileSmallQuery = `(max-width: ${mobileSmallBreak}em)`;
const mobileMediumQuery = `(max-width: ${mobileMediumBreak}em)`;
const mobileQuery = `(max-width: ${mobileBreak}em)`;

export default {
  breakpoints: {
    desktopBreak,
    mobileBreak,
    mobileMediumBreak,
    mobileMediumQuery,
    mobileQuery,
    mobileSmallBreak,
    mobileSmallQuery,
  },
  color,
  padding,
  zIndex,
};
