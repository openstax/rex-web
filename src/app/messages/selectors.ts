import { createSelector } from 'reselect';
import { book as bookSelector } from '../content/selectors';
import { match as matchSelector } from '../navigation/selectors';

export const currentLocale = createSelector(
  bookSelector,
  matchSelector,
  (book, match) => match?.route?.locale || book?.language
);
