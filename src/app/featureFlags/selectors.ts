import { createSelector } from 'reselect';
import { book, bookTheme } from '../content/selectors';
import * as parentSelectors from '../selectors';
import { BookWithOSWebData } from '../content/types';

export const enabled = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.featureFlags
);

export const searchButtonStyle = createSelector(
  enabled,
  (featureFlags) => featureFlags.searchButton
);

export const searchButtonColor = createSelector(
  searchButtonStyle,
  book,
  bookTheme,
  (selectedStyle, selectedBook, selectedTheme) => selectedBook && selectedStyle === 'grayButton' ? 'gray' as BookWithOSWebData['theme'] : (
    selectedBook && selectedStyle === 'bannerColorButton' ? selectedTheme : null
  )
);
