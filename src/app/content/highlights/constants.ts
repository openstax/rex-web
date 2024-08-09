import { KeyCombinationOptions } from '../../reactUtils';

export const modalUrlName = 'MH';

export const cardWidth = 20;
export const cardPadding = 0.8;
export const cardContentMargin = 3;
export const cardFocusedContentMargin = 1;
export const cardMinWindowMargin = 2;
export const cardMarginBottom = 2;

export const highlightBlockPadding = 1;
export const highlightIndicatorSizeForBlock = 1.2;
export const highlightIndicatorSize = 0.9;

export const highlightKeyCombination: KeyCombinationOptions = {
  code: 'KeyH', // key isn't always h when alt is pressed
  altKey: true,
};

export const searchKeyCombination: KeyCombinationOptions = {
  code: 'KeyS',
  altKey: true,
};
