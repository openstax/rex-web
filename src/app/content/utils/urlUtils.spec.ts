import cloneDeep from 'lodash/cloneDeep';
import { book as mockArchiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { resetModules } from '../../../test/utils';
import { Book } from '../types';
import { formatBookData } from '../utils';
import {
  getBookPageUrlAndParams,
  getPageIdFromUrlParam,
  toRelativeUrl
} from './urlUtils';

jest.mock('../../../config', () => {
  const mockBook = (jest as any).requireActual('../../../test/mocks/archiveLoader').book;
  return {BOOKS: {
   [mockBook.id]: {defaultVersion: mockBook.version},
  }};
});

describe('getBookPageUrlAndParams', () => {
  it('generates params without version', () => {
    const result = getBookPageUrlAndParams(formatBookData(mockArchiveBook, mockCmsBook), page);
    expect((result.params as any).version).toBeUndefined();
  });

  it('generates params with version', () => {
    const result = getBookPageUrlAndParams(
      {...formatBookData(mockArchiveBook, mockCmsBook), version: 'asdf'},
      page
    );
    expect((result.params as any).version).toBe('asdf');
  });
});

describe('getUrlParamForPageId', () => {
  let book: Book;
  let getUrlParamForPageId: any;

  beforeEach(() => {
    resetModules();
    getUrlParamForPageId = require('./urlUtils').getUrlParamForPageId;

    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            shortId: 'page@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        shortId: 'book@1',
        title: 'book',
      },
    }) as Book;
  });

  it('finds title in book tree using the short id', () => {
    expect(getUrlParamForPageId(book, 'page')).toEqual('preface');
    expect(getUrlParamForPageId(book, 'page@1')).toEqual('preface');
  });

  it('finds title in book tree using the long id', () => {
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual('preface');
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual('preface');
  });

  it('throws on invalid id', () => {
    expect(() =>
      getUrlParamForPageId(book, 'wokowokowko')
    ).toThrowErrorMatchingInlineSnapshot(
      `"BUG: could not find page \\"wokowokowko\\" in undefined"`
    );
  });
});

describe('getPageIdFromUrlParam', () => {
  let book: Book;

  beforeEach(() => {
    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            shortId: 'page@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        shortId: 'book@1',
        slug: 'book-slug',
        title: 'book',
      },
    }) as Book;
  });

  it('finds id for simple param', () => {
    expect(getPageIdFromUrlParam(book, 'Preface')).toEqual('pagelongid');
  });

  it('ignores captialization', () => {
    expect(getPageIdFromUrlParam(book, 'preface')).toEqual('pagelongid');
  });

  it('returns undefined for unknown route', () => {
    expect(getPageIdFromUrlParam(book, 'asdfasdf')).toBeUndefined();
  });
});

describe('toRelativeUrl', () => {
  const BOOK_SLUG = 'book1';
  const PAGE_SLUG = 'page1';
  const BOOK_URL = `/books/${BOOK_SLUG}`;
  const PAGE_URL = `${BOOK_URL}/pages/${PAGE_SLUG}`;

  it('when the same page', () => {
    const url = toRelativeUrl(PAGE_URL, PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"page1"`);
  });

  it('when in the same book', () => {
    const url = toRelativeUrl(`${BOOK_URL}/pages/doesnotmatter`, PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"page1"`);
  });

  it('when under the same Page (unused)', () => {
    const url = toRelativeUrl(`${PAGE_URL}/doesnotmatter`, PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"../page1"`);
  });

  it('when deeply under the same Page (unused)', () => {
    const url = toRelativeUrl(
      `${PAGE_URL}/doesnotmatter/doesnotmatter`,
      PAGE_URL
    );
    expect(url).toMatchInlineSnapshot(`"../../page1"`);
  });

  it('when in a different book', () => {
    const url = toRelativeUrl(
      '/books/doesnotmatter/pages/doesnotmatter',
      PAGE_URL
    );
    expect(url).toMatchInlineSnapshot(`"../../book1/pages/page1"`);
  });

  it('when at the root', () => {
    const url = toRelativeUrl('/', PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"books/book1/pages/page1"`);
  });

  it('when at the top', () => {
    const url = toRelativeUrl('/doesnotmatter', PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"books/book1/pages/page1"`);
  });

  it('when not in a book and not at the root', () => {
    const url = toRelativeUrl('/doesnotmatter/doesnotmatter', PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"../books/book1/pages/page1"`);
  });

  it('ignores trailing slashes on the target', () => {
    const url = toRelativeUrl(PAGE_URL, PAGE_URL + '/');
    expect(url).toMatchInlineSnapshot(`"page1"`);
  });

  it('ignores trailing slashes on the source', () => {
    const url = toRelativeUrl(PAGE_URL + '/', PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"page1"`);
  });
});
