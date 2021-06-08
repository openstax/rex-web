import * as mockArchive from '../../../test/mocks/archiveLoader';
import { treeWithUnits } from '../../../test/trees';
import { content } from '../routes';
import * as archiveTreeUtils from './archiveTreeUtils';
import { stripIdVersion } from './idUtils';
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
      state: {
        bookUid: book.id,
        bookVersion: book.version,
        pageUid: stripIdVersion(page.id),
      },
    };
    const spyGetBookPageUrlAndParams = jest.spyOn(urlUtils, 'getBookPageUrlAndParams')
      .mockReturnValueOnce({ params: mockParams } as any);
    const spyFindArchiveTreeNodeById = jest.spyOn(archiveTreeUtils, 'findArchiveTreeNodeById');

    const result = createNavigationMatch(page.id, book);
    expect(spyFindArchiveTreeNodeById).toHaveBeenCalled();
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
      state: {
        bookUid: book.id,
        bookVersion: book.version,
        pageUid: stripIdVersion(page.id),
      },
    };
    const spyGetBookPageUrlAndParams = jest.spyOn(urlUtils, 'getBookPageUrlAndParams');
    const spyFindArchiveTreeNodeById = jest.spyOn(archiveTreeUtils, 'findArchiveTreeNodeById');

    const result = createNavigationMatch(page.id, book, mockParams);
    expect(spyFindArchiveTreeNodeById).toHaveBeenCalled();
    expect(spyGetBookPageUrlAndParams).not.toHaveBeenCalled();
    expect(result).toEqual(mockMatch);
  });

  it('return undefined if page was not found in book', () => {
    const { book } = mockArchive;
    const spyFindArchiveTreeNodeById = jest.spyOn(archiveTreeUtils, 'findArchiveTreeNodeById')
      .mockReturnValueOnce(undefined);

    const result = createNavigationMatch(treeWithUnits.id, book);
    expect(spyFindArchiveTreeNodeById).toHaveBeenCalled();
    expect(result).toEqual(undefined);
  });
});
