import { createSelector } from 'reselect';
import { book as bookSelector } from '../content/selectors';
import { match as matchSelector } from '../navigation/selectors';

/*
 * it would be better for contentRoute to be able to figure out its locale in some way based on
 * domain knowledge that it has about how it cares about books, but that introduces some interesting
 * async management issues because a getLocale() function on the route wouldn't know about the status of
 * resolveContent
 */
export const currentLocale = createSelector(
  bookSelector,
  matchSelector,
  (book, match) => match?.route?.locale || book?.language
);
