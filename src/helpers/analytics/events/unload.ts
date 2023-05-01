import { stateChange } from '@openstax/event-capture-client/events';
import { createSelector } from 'reselect';
import * as selectContent from '../../../app/content/selectors';
import * as archiveTreeUtils from '../../../app/content/utils/archiveTreeUtils';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const eventName = 'REX unload';

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
  {pathname, book, page}: ReturnType<typeof selector>
): AnalyticsEvent | void => {
  const getGoogleAnalyticsPayload = () => ({
    eventAction: 'unload',
    eventCategory: eventName,
    eventLabel: pathname,
    nonInteraction: true,
  });

  return book && page ? {
    getEventCapturePayload: () => stateChange({
      current: 'none',
      stateType: 'visibility',
      sourceMetadata: {
        contentId: page.id,
        contentIndex: archiveTreeUtils.getPageIndex(book.tree, page.id),
        contentVersion: book.contentVersion,
        contextVersion: book.archiveVersion,
        scopeId: book.id,
      },
    }),
    getGoogleAnalyticsPayload,
  } : { getGoogleAnalyticsPayload };
};
