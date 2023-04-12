import { NewHighlightPayload } from '../../../../app/content/highlights/types';
import { Book, Page } from '../../../../app/content/types';
import { track } from './createNote';

const note = {
  color: 'foo',
} as unknown as NewHighlightPayload;

describe('createNote event', () => {
  describe('ga', () => {
    it('reports color in action', () => {
      const page = {id: 'pageid'} as Page;
      const event = track({pathname: 'asdf', book: {id: 'bookid', tree: {id: 'bookid', contents: [page]}} as unknown as Book, page}, note, {isDefaultColor: false});

      if (!event || !event.getGoogleAnalyticsPayload) {
        return expect(false).toBeTruthy();
      }

      const payload = event.getGoogleAnalyticsPayload();

      expect(payload.eventAction).toEqual('foo');
    });

    it('reports color as "Default" if isDefaultColor is set', () => {
      const page = {id: 'pageid'} as Page;
      const event = track({pathname: 'asdf', book: {id: 'bookid', tree: {id: 'bookid', contents: [page]}} as unknown as Book, page}, note, {isDefaultColor: true});

      if (!event || !event.getGoogleAnalyticsPayload) {
        return expect(false).toBeTruthy();
      }

      const payload = event.getGoogleAnalyticsPayload();

      expect(payload.eventAction).toEqual('default');
    });
  });
});
