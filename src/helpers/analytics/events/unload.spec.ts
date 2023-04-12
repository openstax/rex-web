import { Book, Page } from '../../../app/content/types';
import { track } from './unload';

const pathname = '/some/path';

describe('unload', () => {

  describe('google analytics', () => {
    it('tracks unload', () => {
      const page = {id: 'pageid'} as Page;
      const result = track({
        pathname,
        book: {id: 'bookid', tree: {id: 'bookid', contents: [page]}} as unknown as Book,
        page
      });
      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getGoogleAnalyticsPayload) {
        return expect(result.getGoogleAnalyticsPayload).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload()).toEqual({
        eventAction: 'unload',
        eventCategory: 'REX unload',
        eventLabel: pathname,
        nonInteraction: true,
      });
    });
  });
});
