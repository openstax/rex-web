import Highlighter from '@openstax/highlighter';
import { SearchResult } from '@openstax/open-search-client/dist/models/SearchResult';
import { HTMLDivElement } from '@openstax/types/lib.dom';
import * as mockArchive from '../../..//test/mocks/archiveLoader';
import * as rangyHelpers from '../../../helpers/rangy';
import Sentry from '../../../helpers/Sentry';
import { mockRange } from '../../../test/mocks/rangy';
import { makeSearchResultHit, makeSearchResults } from '../../../test/searchResults';
import { treeWithoutUnits, treeWithUnits } from '../../../test/trees';
import { assertDocument } from '../../utils';
import { ArchivePage, LinkedArchiveTree } from '../types';
import { getFirstResult, getFormattedSearchResults, highlightResults } from './utils';

jest.mock('@openstax/highlighter/dist/Highlight', () => ({
  default: class {
    public data: string;
    constructor(_range: any, data: any) {
      this.data = data;
    }
  },
}));

describe('getFirstResult', () => {

  it('works with empty results', () => {
    const searchResults: SearchResult = makeSearchResults([]);
    expect(getFirstResult({tree: treeWithoutUnits}, searchResults)).toEqual(null);
  });

  it('finds chapter page', () => {
    const chapterHit = makeSearchResultHit({
      book: {...mockArchive.book, tree: treeWithoutUnits},
      page: treeWithoutUnits.contents[1].contents![0] as unknown as ArchivePage,
    });
    const searchResults: SearchResult = makeSearchResults([
      chapterHit,
    ]);

    const result = getFirstResult({tree: treeWithoutUnits}, searchResults);

    if (!result) {
      return expect(result).toBeTruthy();
    }

    expect(result.result.source.pageId).toEqual(treeWithoutUnits.contents[1].contents![0].id);
  });
});

describe('getFormattedSearchResults', () => {
  describe('treeWithoutUnits', () => {

    it('works with empty results', () => {
      const searchResults: SearchResult = makeSearchResults([]);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults).length).toBe(0);
    });

    it('preserves chapter structure', () => {
      const chapterHit = makeSearchResultHit({
        book: {...mockArchive.book, tree: treeWithoutUnits},
        page: treeWithoutUnits.contents[1].contents![0] as unknown as ArchivePage,
      });
      const searchResults: SearchResult = makeSearchResults([
        chapterHit,
      ]);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults)).toContainEqual(expect.objectContaining({
        contents: [
          expect.objectContaining({
            id: treeWithoutUnits.contents[1].contents![0].id,
            results: [chapterHit],
          }),
        ],
        id: treeWithoutUnits.contents[1].id,
      }));
    });

    it('collapses end of chapter content', () => {
      const chapterHit = makeSearchResultHit({
        book: {...mockArchive.book, tree: treeWithoutUnits},
        page: treeWithoutUnits.contents[1].contents![2].contents![0] as unknown as ArchivePage,
      });
      const searchResults: SearchResult = makeSearchResults([
        chapterHit,
      ]);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults)).toContainEqual(expect.objectContaining({
        contents: [
          expect.objectContaining({
            id: treeWithoutUnits.contents[1].contents![2].contents![0].id,
            results: [chapterHit],
          }),
        ],
        id: treeWithoutUnits.contents[1].id,
      }));
    });

    it('preserves end of book content', () => {
      const chapterHit = makeSearchResultHit({
        book: {...mockArchive.book, tree: treeWithoutUnits},
        page: treeWithoutUnits.contents[2] as unknown as ArchivePage,
      });
      const searchResults: SearchResult = makeSearchResults([
        chapterHit,
      ]);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults)).toContainEqual(expect.objectContaining({
        id: treeWithoutUnits.contents[2].id,
        results: [chapterHit],
      }));
    });
  });

  describe('treeWithUnits', () => {
    it('collapses unit structure', () => {
      const unit = treeWithUnits.contents[1] as LinkedArchiveTree;
      const chapter = unit.contents[0] as LinkedArchiveTree;

      const chapterHit = makeSearchResultHit({
        book: {...mockArchive.book, tree: treeWithUnits},
        page: chapter.contents![0] as unknown as ArchivePage,
      });
      const searchResults: SearchResult = makeSearchResults([
        chapterHit,
      ]);

      expect(getFormattedSearchResults(treeWithUnits, searchResults)).toContainEqual(expect.objectContaining({
        contents: [
          expect.objectContaining({
            id: chapter.contents![0].id,
            results: [chapterHit],
          }),
        ],
        id: unit.contents[0].id,
      }));
    });
  });
});

describe('highlightResults', () => {
  let findTextInRange: jest.SpyInstance;
  let highlight: jest.SpyInstance;
  let captureException: jest.SpyInstance;
  let highlighter: Highlighter;
  let container: HTMLDivElement;

  beforeEach(() => {
    findTextInRange = jest.spyOn(rangyHelpers, 'findTextInRange');
    findTextInRange.mockImplementation((_element: any, searchString: string) => ([mockRange(searchString)]));

    container = assertDocument().createElement('div');
    highlighter = new Highlighter(container, { formatMessage: jest.fn() });

    captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => undefined);
  });

  describe('without errors' , () => {
    beforeEach(() => {
      highlight = jest.spyOn(highlighter, 'highlight').mockImplementation((hl: any) => {
        hl.elements = [{}];
      });
    });

    it('highlights a result', () => {
      const results = [
        makeSearchResultHit({
          book: mockArchive.book,
          highlights: ['asdf <strong>qwer</strong> foo'],
          page: mockArchive.page,
        }),
      ];

      const element = assertDocument().createElement('p');
      element.id = results[0].source.elementId;
      container.append(element);

      highlightResults(highlighter, results);

      expect(highlight.mock.calls[0][0]!.data).toEqual({content: 'qwer'});
    });

    it('works on sections with no matches', () => {
      const results = [
        makeSearchResultHit({
          book: mockArchive.book,
          highlights: ['asdf foo … <strong>asdf</strong>'],
          page: mockArchive.page,
        }),
      ];

      const element = assertDocument().createElement('p');
      element.id = results[0].source.elementId;
      container.append(element);

      highlightResults(highlighter, results);

      expect(highlight.mock.calls[0][0]!.data).toEqual({content: 'asdf'});
    });

    it('falls back on whole element if text can\'t be found', () => {
      const results = [
        makeSearchResultHit({
          book: mockArchive.book,
          highlights: ['asdf <strong>qwer</strong> foo'],
          page: mockArchive.page,
        }),
      ];

      findTextInRange.mockReturnValue([]);

      const element = assertDocument().createElement('p');
      element.textContent = 'Asdfasdf asdfklj adlk fasd;lfk ajsdf';
      element.id = results[0].source.elementId;
      container.append(element);

      highlightResults(highlighter, results);

      expect(highlight.mock.calls[0][0]!.data).toEqual({content: element.textContent});
    });

    it('works if element is not found', () => {
      const results = [
        makeSearchResultHit({
          book: mockArchive.book,
          highlights: ['asdf <strong>qwer</strong> foo'],
          page: mockArchive.page,
        }),
      ];

      highlightResults(highlighter, results);

      expect(highlight).not.toBeCalled();
    });
  });

  describe('with errors' , () => {
    beforeEach(() => {
      highlight = jest.spyOn(highlighter, 'highlight').mockImplementation(() => {
        throw new Error('error');
      });
    });

    it('calls Sentry after highlighting error', () => {
      const results = [
        makeSearchResultHit({
          book: mockArchive.book,
          highlights: ['asdf foo … <strong>asdf</strong>'],
          page: mockArchive.page,
        }),
      ];

      const element = assertDocument().createElement('p');
      element.id = results[0].source.elementId;
      container.append(element);

      highlightResults(highlighter, results);

      expect(highlight.mock.calls[0][0]!.data).toEqual({content: 'asdf'});

      expect(captureException).toHaveBeenCalled();
    });
  });
});
