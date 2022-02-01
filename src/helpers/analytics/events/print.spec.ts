import { formatBookData } from '../../../app/content/utils';
import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { track } from './print';

const book = formatBookData(archiveBook, mockCmsBook);

describe('print', () => {

  describe('google analytics', () => {
    it('reports slug', () => {
      const result = track({book, pathname: 'asdf'});
      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getGoogleAnalyticsPayload) {
        return expect(result.getGoogleAnalyticsPayload).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventAction).toEqual(book.slug);
    });
  });
});
