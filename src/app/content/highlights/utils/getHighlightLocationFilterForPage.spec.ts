import { book, page, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { getHighlightLocationFilterForPage, getHighlightLocationFilters } from './';

describe('getHighlightLocationFilterForPage', () => {
  it('should not return anything for page which is not in book', () => {
    const locationFilters = getHighlightLocationFilters(book);
    const location = getHighlightLocationFilterForPage(locationFilters, {...pageInChapter, id: 'not-in-book' });
    expect(location).toBeUndefined();
  });

  it('should return chapter for page in chapter', () => {
    const locationFilters = getHighlightLocationFilters(book);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location!.id).toEqual('testbook1-testchapter5-uuid');
  });

  it('should return page for page directly in book tree (Preface)', () => {
    const locationFilters = getHighlightLocationFilters(book);
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location!.id).toEqual(page.id);
  });
});
