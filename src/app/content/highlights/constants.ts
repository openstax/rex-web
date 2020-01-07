import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
export const highlightingFeatureFlag = 'enableHighlighting';

export const cardWidth = 20;
export const cardPadding = 0.8;
export const cardContentMargin = 3;
export const cardFocusedContentMargin = 1;
export const cardMinWindowMargin = 2;

export const highlightStyles: Array<{label: HighlightColorEnum, passive: string, focused: string}> = [
  {label: HighlightColorEnum.Yellow, passive: '#ffff8a', focused: '#fed200'},
  {label: HighlightColorEnum.Green, passive: '#def99f', focused: '#92d101'},
  {label: HighlightColorEnum.Blue, passive: '#c8f5ff', focused: '#00c3ed'},
  {label: HighlightColorEnum.Purple, passive: '#cbcfff', focused: '#545ec8'},
  {label: HighlightColorEnum.Pink, passive: '#ffc5e1', focused: '#de017e'},
];

export const enabledForBooks = [
  /* Calculus vol 1 */ '8b89d172-2927-466f-8661-01abc7ccdba4',
];
