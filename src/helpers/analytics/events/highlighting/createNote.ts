import { createdHighlight } from '@openstax/event-capture-client/events';
import { createSelector } from 'reselect';
import { NewHighlightPayload } from '../../../../app/content/highlights/types';
import * as selectContent from '../../../../app/content/selectors';
import * as archiveTreeUtils from '../../../../app/content/utils/archiveTreeUtils';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const createNote = 'REX highlighting (inline create)';

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
  highlight: NewHighlightPayload,
  {isDefaultColor}: {isDefaultColor?: boolean}
): AnalyticsEvent | void => {
  const getGoogleAnalyticsPayload = () => ({
    eventAction: isDefaultColor ? 'default' : highlight.color,
    eventCategory: createNote,
    eventLabel: pathname,
  });

  return book && page ? {
    getEventCapturePayload: () => createdHighlight({
      ...highlight,
      annotation: highlight.annotation || '',
      highlightId: highlight.id,
      locationStrategies: JSON.stringify(highlight.locationStrategies),
      sourceMetadata: {
        contentId: page.id,
        contentIndex: archiveTreeUtils.getPageIndex(book.tree, page.id)?.toString(),
        contentVersion: book.contentVersion,
        contextVersion: book.archiveVersion,
        scopeId: book.id,
      },
    }),
    getGoogleAnalyticsPayload,
  } : { getGoogleAnalyticsPayload };
};
