import { FlattenSimpleInterpolation } from 'styled-components';
import { css } from 'styled-components/macro';
// based on https://sketchviewer.com/sketches/59766aabb57e8900114c89ce/latest/

export interface ColorSet {
  base: string;
  foreground: string;
  darker?: string;
  darkest?: string;
}

export const hiddenButAccessible = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
`;

const textColors = {
  black: '#000',
  default: '#424242',
  label: '#6f6f6f',
  white: '#fff',
};

// Browser default outline for focus items per
// tslint:disable-next-line:max-line-length
// https://css-tricks.com/copy-the-browsers-native-focus-styles/
export const defaultFocusOutline = `
  outline: 0.2rem auto Highlight;
  outline: 0.2rem auto -webkit-focus-ring-color;
`;

const greyColors = {
  base: '#5e6062',
  darker: '#424242',
  foreground: textColors.white,
  foregroundHover: '#424242',
  light: '#767676', // lightest allowed for text on white background
  lighter: '#c5c5c5',
  lightest: '#ededed',
};

const padding = {
  page: {
    desktop: 3.2,
    mobile: 1.6,
  },
};

const color = {
  black: '#000',
  disabled: {
    base: '#f1f1f1',
    foreground: '#c1c1c1',
  },
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
      foregroundHover: greyColors.darker,
    },
    'deep-green': {
      base: '#067056',
      foreground: textColors.white,
      foregroundHover: greyColors.darker,
    },
    'gray': greyColors,
    'green': {
      base: '#63a524',
      foreground: textColors.black,
      foregroundHover: greyColors.light,
    },
    'light-blue': {
      base: '#0DC0DC',
      foreground: textColors.black,
      foregroundHover: greyColors.light,
    },
    'midnight': {
      base: '#003e52',
      foreground: textColors.white,
      foregroundHover: greyColors.darker,
    },
    'orange': {
      base: '#d4450c',
      darker: '#be3c08',
      darkest: '#b03808',
      foreground: textColors.white,
      foregroundHover: greyColors.darker,
    },
    'raise-green': {
      base: '#0a5b50',
      foreground: textColors.white,
      foregroundHover: greyColors.darker,
    },
    'red': {
      base: '#C22032',
      foreground: textColors.white,
      foregroundHover: greyColors.darker,
    },
    'yellow': {
      base: '#f4d019',
      foreground: textColors.black,
      foregroundHover: greyColors.light,
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

const mobileSmallBreak = 30; // 480px
const mobileMediumBreak = 50; // 800px
const mobileBreak = 75; // 1200px
const desktopBreak = mobileBreak + .0625; // 1201px
const mobileSmallQuery = `(max-width: ${mobileSmallBreak}em)`;
const mobileMediumQuery = `(max-width: ${mobileMediumBreak}em)`;
const mobileQuery = `(max-width: ${mobileBreak}em)`;
const touchDeviceQuery = `not all and (pointer: fine), (hover: none)`;

export default {
  breakpoints: {
    desktopBreak,
    mobile: (style: FlattenSimpleInterpolation) => css`
      @media screen and ${mobileQuery} {
        ${style}
      }
    `,
    mobileBreak,
    mobileMedium: (style: FlattenSimpleInterpolation) => css`
      @media screen and ${mobileMediumQuery} {
        ${style}
      }
    `,
    mobileMediumBreak,
    mobileMediumQuery,
    mobileQuery,
    mobileSmall: (style: FlattenSimpleInterpolation) => css`
      @media screen and ${mobileSmallQuery} {
        ${style}
      }
    `,
    mobileSmallBreak,
    mobileSmallQuery,
    touchDeviceQuery: (style: FlattenSimpleInterpolation) => css`
      @media screen and ${mobileQuery} {
        @media ${touchDeviceQuery} {
          ${style}
        }
      }
    `,
  },
  color,
  padding,
  zIndex: [
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
  ].reduce((result, key, index) => {
    result[key] = (index + 1) * 10;
    return result;
  }, {} as {[key: string]: number}),
};
