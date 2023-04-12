import * as events from '@openstax/event-capture-client/events';
import { Book, Page } from '../../../../app/content/types';
import { track } from './openPopUp';

describe('open study guide popup', () => {
  describe('creates event capture payload', () => {
    it('reports referrer', () => {
      const page = {id: 'pageid'} as Page;
      const result = track({
        pathname: 'asdf',
        book: {
          id: 'bookid',
          contentVersion: '123',
          archiveVersion: '456',
          tree: {id: 'bookid', contents: [page]},
        } as unknown as Book,
        page
      }, 'button');
      const factory = jest.spyOn(events, 'accessedStudyguide');

      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getEventCapturePayload) {
        return expect(result.getEventCapturePayload).toBeTruthy();
      }

      result.getEventCapturePayload();

      expect(factory).toHaveBeenCalledWith({
        pageId: 'pageid',
        bookId: 'bookid',
        sourceMetadata: {
          contentId: 'pageid',
          contentIndex: '0',
          contentVersion: '123',
          contextVersion: '456',
          scopeId: 'bookid',
        },
      });
    });

    it('but not if book is unavailable', () => {
      const result = track({
        pathname: 'asdf',
        book: undefined,
        page: {id: 'pageid'} as Page,
      }, 'button');

      if (!result) {
        return expect(result).toBeTruthy();
      }

      expect(result.getEventCapturePayload).toBeUndefined();
    });

    it('but not if page is unavailable', () => {
      const result = track({
        pathname: 'asdf',
        book: { id: 'bookid', tree: [] } as unknown as Book,
        page: undefined,
      }, 'button');

      if (!result) {
        return expect(result).toBeTruthy();
      }

      expect(result.getEventCapturePayload).toBeUndefined();
    });
  });
});
