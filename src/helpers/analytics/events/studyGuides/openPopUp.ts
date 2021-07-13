import { accessedStudyguide } from '@openstax/event-capture-client/events';
import { createSelector } from 'reselect';
import * as selectContent from '../../../../app/content/selectors';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const openSG = 'REX Study guides (open SG popup)';

export const selector = createSelector(
  selectNavigation.pathname,
  selectContent.bookAndPage,
  (pathname, {book, page}) => ({
    book,
    page,
    pathname,
  })
);

export const track = (
  {pathname, book, page}: ReturnType<typeof selector>,
  openMethod: 'button'
): AnalyticsEvent | void => {
  return {
    ...(page && book ? {
      getEventCapturePayload: () => accessedStudyguide({pageId: page.id, bookId: book.id}),
    } : {}),
    getGoogleAnalyticsPayload: () => ({
      eventAction: openMethod as string,
      eventCategory: openSG,
      eventLabel: pathname,
    }),
  };
};
