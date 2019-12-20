import { book, page, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { getHighlightLocationForPage, getHighlightLocationsFromBook } from '../utils';

describe('getHighlightLocationForPage', () => {
  it('should not return anything for page which is not in book', () => {
    const locations = getHighlightLocationsFromBook(book);
    const location = getHighlightLocationForPage(locations, {...pageInChapter, id: 'not-in-book' });
    expect(location).toBeUndefined();
  });

  it('should return chapter for page in chapter', () => {
    const locations = getHighlightLocationsFromBook(book);
    const location = getHighlightLocationForPage(locations, pageInChapter);
    expect(location!.id).toEqual('testbook1-testchapter5-uuid');
  });

  it('should return page for page directly in book tree (Preface)', () => {
    const locations = getHighlightLocationsFromBook(book);
    const location = getHighlightLocationForPage(locations, page);
    expect(location!.id).toEqual(page.id);
  });
});
