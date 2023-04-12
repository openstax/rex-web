import { stateChange } from '@openstax/event-capture-client/events';
import { Document } from '@openstax/types/lib.dom';
import * as selectContent from '../../../app/content/selectors';
import * as archiveTreeUtils from '../../../app/content/utils/archiveTreeUtils';
import { AnalyticsEvent } from './event';

export const selector = selectContent.bookAndPage;

export const track = (
  {book, page}: ReturnType<typeof selector>,
  document: Document
): AnalyticsEvent | void => {
  const focus = document.hasFocus();
  const visible = document.visibilityState === 'visible';

  const current = focus
    ? 'focused'
    : visible
      ? 'visible'
      : 'background'
  ;

  return book && page ? {
    getEventCapturePayload: () => stateChange({
      current,
      stateType: 'visibility',
      sourceMetadata: {
        contentId: page.id,
        contentIndex: archiveTreeUtils.getPageIndex(book.tree, page.id)?.toString(),
        contentVersion: book.contentVersion,
        contextVersion: book.archiveVersion,
        scopeId: book.id,
      },
    }),
  } : {};
};
