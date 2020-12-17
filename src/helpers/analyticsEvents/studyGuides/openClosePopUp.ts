import { events } from '@openstax/event-capture-client';
import { createSelector } from 'reselect';
import * as selectContent from '../../../app/content/selectors';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const openSG = 'REX Study guides (open SG popup)';
const closeSG = 'REX Study guides (close SG popup)';

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
  closeAction?: string
): AnalyticsEvent | void => {
  return {
    ...(page && book ? {
      getEventCapturePayload: () => events.accessedStudyguide({pageId: page.id, bookId: book.id}),
    } : {}),
    getGoogleAnalyticsPayload: () => ({
      eventAction: closeAction ? closeAction : 'button',
      eventCategory: closeAction ? closeSG : openSG,
      eventLabel: pathname,
    }),
  };
};
