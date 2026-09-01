/**
 * Pure theme data: colors, padding, z-indexes and breakpoint sizes.
 *
 * This module deliberately has no imports and no side effects, so that it can be
 * read by `script/generate-theme-css.ts` at build time without pulling
 * styled-components (or React, or any CSS) into the generator. `theme.ts` spreads
 * everything here into its default export, so `theme.color.x` paths are unchanged.
 *
 * Every value here is projected into a CSS custom property in `theme.css` by
 * `themeCss.ts`. Do not hand-copy a value from here into a stylesheet — reference
 * its token instead. `theme.spec.ts` fails the build if you do.
 */

export interface ColorSet {
  base: string;
  foreground: string;
  darker?: string;
  darkest?: string;
}

export const textColors = {
  black: '#000',
  default: '#424242',
  label: '#6f6f6f',
  white: '#fff',
};

export const grayColors = {
  base: '#5e6062',
  darker: '#424242',
  foreground: textColors.white,
  foregroundHover: '#424242',
  light: '#767676', // lightest allowed for text on white background
  medium: '#888888', // suitable for darkening white on a dark background
  lighter: '#c5c5c5',
  lightest: '#ededed',
};

/**
 * Link colors. Re-exported by `components/Typography/Links.constants.ts`, which is
 * where JS consumers should keep importing them from.
 */
export const linkColors = {
  base: '#027EB5',
  focusOutline: '#007297',
  hover: '#0064A0',
};

export const padding = {
  page: {
    desktop: 3.2,
    mobile: 1.6,
  },
};

export const color = {
  black: '#000',
  disabled: {
    base: '#f1f1f1',
    foreground: '#c1c1c1',
  },
  link: linkColors,
  neutral: {
    base: '#fff',
    darker: '#fafafa',
    darkest: '#e5e5e5',
    foreground: textColors.default,
    formBackground: '#f5f5f5',
    formBorder: '#d5d5d5',
    pageBackground: '#f1f1f1',
  },
  primary: {
    'blue': {
      base: '#002468',
      foreground: textColors.white,
      foregroundHover: grayColors.medium,
    },
    'deep-green': {
      base: '#067056',
      foreground: textColors.white,
      foregroundHover: grayColors.lighter,
    },
    'gray': grayColors,
    'green': {
      base: '#63a524',
      foreground: textColors.black,
      foregroundHover: grayColors.darker,
    },
    'light-blue': {
      base: '#0DC0DC',
      foreground: textColors.black,
      foregroundHover: grayColors.darker,
    },
    'midnight': {
      base: '#003e52',
      foreground: textColors.white,
      foregroundHover: grayColors.medium,
    },
    'orange': {
      base: '#d4450c',
      darker: '#be3c08',
      darkest: '#b03808',
      foreground: textColors.white,
      foregroundHover: grayColors.lightest,
    },
    'raise-green': {
      base: '#0a5b50',
      foreground: textColors.white,
      foregroundHover: grayColors.lighter,
    },
    'red': {
      base: '#C22032',
      foreground: textColors.white,
      foregroundHover: grayColors.lighter,
    },
    'yellow': {
      base: '#f4d019',
      foreground: textColors.black,
      foregroundHover: grayColors.light,
    },
  },
  secondary: {
    deepGreen: {base: '#0c9372'},
    gold: {base: '#fdbd3e'},
    lightBlue: {base: '#0dc0dc'},
    lightGray: {
      base: '#949494',
      darker: '#8b8b8b',
      darkest: '#818181',
      foreground: textColors.white,
    },
    red: {base: '#c22032'},
  },
  text: textColors,
  white: '#fff',
};

export const mobileSmallBreak = 30; // 480px
export const mobileMediumBreak = 50; // 800px
export const mobileBreak = 75; // 1200px
export const desktopBreak = mobileBreak + .0625; // 1201px

export const zIndexOrder = [
  'highlightInlineCard',
  'contentNotifications',
  'topbar',
  'overlay',
  'sidebar',
  'toolbar',
  'navbar',
  'mobileMenu',
  'sidebarMobileMedium',
  'keyboardShortcutsPopup',
  'highlightSummaryPopup',
  'highlightsHelpInfoMobile',
  'nudgeOverlay',
  'errorPopup',
  'focusedHiddenLink',
];

export const zIndex = zIndexOrder.reduce((result, key, index) => {
  result[key] = (index + 1) * 10;
  return result;
}, {} as {[key: string]: number});
