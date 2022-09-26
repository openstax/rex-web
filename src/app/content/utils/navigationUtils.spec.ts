import * as mockArchive from '../../../test/mocks/archiveLoader';
import { content } from '../routes';
import { createNavigationMatch } from './navigationUtils';
import * as urlUtils from './urlUtils';

describe('createRouteMatchOptions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates route match if page was found in book', () => {
    const { book, page } = mockArchive;
    const mockParams = {
      book: { slug: 'book' },
      page: { slug: 'page' },
    };
    const mockMatch = {
      params: mockParams,
      route: content,
      state: { },
    };
    const spyGetBookPageUrlAndParams = jest.spyOn(urlUtils, 'getBookPageUrlAndParams')
      .mockReturnValueOnce({ params: mockParams } as any);

    const result = createNavigationMatch(page, book);
    expect(spyGetBookPageUrlAndParams).toHaveBeenCalled();
    expect(result).toEqual(mockMatch);
  });

  it('creates route match with params passed', () => {
    const { book, page } = mockArchive;
    const mockParams = {
      book: { slug: 'book' },
      page: { slug: 'page' },
    };
    const mockMatch = {
      params: mockParams,
      route: content,
      state: { },
    };
    const spyGetBookPageUrlAndParams = jest.spyOn(urlUtils, 'getBookPageUrlAndParams');

    const result = createNavigationMatch(page, book, mockParams);
    expect(spyGetBookPageUrlAndParams).not.toHaveBeenCalled();
    expect(result).toEqual(mockMatch);
  });
});
