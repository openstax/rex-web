import { createSelector } from 'reselect';
import * as selectContent from '../../../app/content/selectors';
import { AnalyticsEvent } from '../event';

const eventName = 'REX highlighting - create note';

export const selector = createSelector(
  selectContent.book,
  (book) => ({book})
);

export const track = (
  {book}: ReturnType<typeof selector>,
  color: string
): AnalyticsEvent | void => {
  const slug = book ? book.slug : 'unknown';

  console.log(color);

  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: color,
      eventCategory: eventName,
      eventLabel: slug,
    }),
  };
};
