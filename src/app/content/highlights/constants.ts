import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import books from '../../../config.books';
export const highlightingFeatureFlag = 'enableHighlighting';

export const summaryPageSize = 20;
export const loadMoreDistanceFromBottom = 50;

export const cardWidth = 20;
export const cardPadding = 0.8;
export const cardContentMargin = 3;
export const cardFocusedContentMargin = 1;
export const cardMinWindowMargin = 2;
export const cardMarginBottom = 2;

export const highlightStyles: Array<{label: HighlightColorEnum, passive: string, focused: string}> = [
  {label: HighlightColorEnum.Yellow, passive: '#ffff8a', focused: '#fed200'},
  {label: HighlightColorEnum.Green, passive: '#def99f', focused: '#92d101'},
  {label: HighlightColorEnum.Blue, passive: '#c8f5ff', focused: '#00c3ed'},
  {label: HighlightColorEnum.Purple, passive: '#cbcfff', focused: '#545ec8'},
  {label: HighlightColorEnum.Pink, passive: '#ffc5e1', focused: '#de017e'},
];

export const enabledForBooks = Object.keys(books);
