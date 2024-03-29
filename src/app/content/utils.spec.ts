import cloneDeep from 'lodash/fp/cloneDeep';
import { resetModules } from '../../test/utils';
import { ArchiveBook, ArchivePage, ArchiveTree, Book, VersionedArchiveBookWithConfig } from './types';
import {
  getContentPageReferences,
  getIdFromPageParam,
  getPageIdFromUrlParam,
  parseContents,
  stripIdVersion,
  toRelativeUrl
} from './utils';

const oldPipelineVersion = '20220101.111111';
const newPipelineVersion = '20220101.222222';

jest.mock('../../config.books', () => ({
  '13ac107a-f15f-49d2-97e8-60ab2e3b519c': { defaultVersion: '29.7' },
  '9d8df601-4f12-4ac1-8224-b450bf739e5f': {
    archiveOverride: `/apps/archive/${oldPipelineVersion}`,
    defaultVersion: '1',
  },
}));

jest.mock('../../config', () => ({
  REACT_APP_ARCHIVE_URL: `/apps/archive/${newPipelineVersion}`,
}));

describe('stripIdVersion', () => {
  it('strips ids', () => {
    expect(stripIdVersion('asdf@qwer')).toEqual('asdf');
  });

  it('doesn\'t break with no id', () => {
    expect(stripIdVersion('asdf')).toEqual('asdf');
  });
});

describe('getContentPageReferences', () => {
  let book: VersionedArchiveBookWithConfig;
  let page: ArchivePage;

  beforeEach(() => {
    book = {
      archiveVersion: '/test/archive-url',
      contentVersion: '1',
      id: 'booklongid',
      language: 'en',
      license: {
        name: '',
        url: '',
        version: '1.0',
      },
      loadOptions: {
        booksConfig: {
          archiveUrl: '/test/archive-url',
          books: {booklongid: {defaultVersion: '1'}},
        },
      },
      revised: '',
      title: 'book',
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid',
        slug: 'unused-archive-slug',
        title: 'book',
      },
      version: '1',
    } as VersionedArchiveBookWithConfig;

    page = {
      abstract: '',
      content: 'some cool content',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      slug: 'mock-slug',
      title: 'qerqwer',
    };
  });

  it('works with no references in the content', () => {
    expect(getContentPageReferences(book, page)).toEqual([]);
  });

  it('works with empty content', () => {
    page.content = '';
    expect(getContentPageReferences(book, page)).toEqual([]);
  });

  it ('works with hash links', () => {
    page.content = '<a href="#foo"></a>';
    expect(getContentPageReferences(book, page)).toEqual([
      {
        bookId: 'booklongid',
        bookVersion: '1',
        match: '#foo',
        pageId: 'adsfasdf',
      },
    ]);
  });

  it('ignores urls not in links', () => {
    page.content = 'asdfasdfasf /contents/as8s8xu9sdnjsd9 asdfadf';
    expect(getContentPageReferences(book, page)).toEqual([]);
  });

  it('ignores urls without book version', () => {
    page.content = 'asdfasdfasf <a href="/contents/as8s8xu9sdnjsd9"></a> asdfadf';
    expect(getContentPageReferences(book, page)).toEqual([]);
  });

  it('ignores links with no href', () => {
    page.content = '<a name="foo"></a>';
    expect(getContentPageReferences(book, page)).toEqual([]);
  });

  it('picks rap links without book version even if they are not in config.books.json', () => {
    page.content = `
      asdfa <a href="./13ac107a-f15f-49d2-97e8-60ab2e3wrong:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a>
    `;
    expect(
      getContentPageReferences(book, page)
    ).toEqual([
      {
        bookId: '13ac107a-f15f-49d2-97e8-60ab2e3wrong',
        bookVersion: undefined,
        match: './13ac107a-f15f-49d2-97e8-60ab2e3wrong:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml',
        pageId: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      },
    ]);
  });

  it('picks up multiple rap links', () => {
    page.content = `
      asdfa <a href="./13ac107a-f15f-49d2-97e8-60ab2e3b519c@29.7:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a> sdf
      <a href="./13ac107a-f15f-49d2-97e8-60ab2e3b519c:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a>
    `;
    expect(
      getContentPageReferences(book, page)
    ).toEqual([
      {
        bookId: '13ac107a-f15f-49d2-97e8-60ab2e3b519c',
        bookVersion: '29.7',
        match: './13ac107a-f15f-49d2-97e8-60ab2e3b519c@29.7:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml',
        pageId: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      },
      {
        bookId: '13ac107a-f15f-49d2-97e8-60ab2e3b519c',
        bookVersion: undefined,
        match: './13ac107a-f15f-49d2-97e8-60ab2e3b519c:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml',
        pageId: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      },
    ]);
  });
});

describe('getUrlParamForPageId', () => {
  let book: Book;
  let getUrlParamForPageId: any;

  beforeEach(() => {
    resetModules();
    getUrlParamForPageId = require('./utils').getUrlParamForPageId;

    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        title: 'book',
      },
    }) as Book;
  });

  it('finds title in book tree using the long id', () => {
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual({slug: 'preface'});
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual({slug: 'preface'});
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
    book = {
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        slug: 'book-slug',
        title: 'book',
      },
    } as Book;
  });

  it('finds id for simple param', () => {
    expect(getPageIdFromUrlParam(book, {slug: 'Preface'})).toEqual('pagelongid');
  });

  it('ignores captialization', () => {
    expect(getPageIdFromUrlParam(book, {slug: 'preface'})).toEqual('pagelongid');
  });

  it('returns undefined for unknown route', () => {
    expect(getPageIdFromUrlParam(book, {slug: 'asdfasdf'})).toBeUndefined();
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
});

describe('parseContents', () => {
  const appendixHtml = '<span class="os-number">' +
    '<span class="os-part-text">Appendix </span>' +
    'D' +
  '</span>' +
  '<span class="os-divider"> </span>' +
  '<span data-type="" itemprop="" class="os-text">Book title</span>';
  const unitHtml = '<span class="os-number">1</span>' +
    '<span class="os-divider"> </span>' +
    '<span data-type="" itemprop="" class="os-text">The Chemistry of Life</span>';
  const unit2Html = '<span data-type="" itemprop="" class="os-text">The Chemistry of Life</span>';
  const chapterHtml = '<span class="os-number">1</span>' +
    '<span class="os-divider"> </span>' +
    '<span data-type="" itemprop="" class="os-text">The Study of Life</span>';
  const chapter2Html = '<span class="os-number">2</span>' +
    '<span class="os-divider"> </span>' +
    '<span data-type="" itemprop="" class="os-text">The Chemical Foundation of Life</span>';
  const pageHtml = '<span class="os-number">1.1</span>' +
    '<span class="os-divider"> </span>' +
    '<span data-type="" itemprop="" class="os-text">The Science of Biology</span>';

  let book: ArchiveBook;

  beforeEach(() => {
    book = {
      tree: {
        contents: [
          {id: 'appendix@sth', title: appendixHtml},
          {
            contents: [
              {id: 'chapter@sth', title: chapterHtml, contents: [{id: 'page@sth', title: pageHtml}]},
              {id: 'chapter2@sth', title: chapterHtml, contents: [{id: 'page@sth', title: pageHtml}]},
            ],
            id: 'unit@unit',
            title: unitHtml,
          },
          {
            contents: [
              {id: 'chapter@sth', title: chapter2Html, contents: [{id: 'page2@sth', title: pageHtml}]},
              {id: 'chapter2@sth', title: chapter2Html, contents: [{id: 'page2@sth', title: pageHtml}]},
            ],
            id: 'unit2@unit',
            title: unit2Html,
          },
        ],
        id: 'book@sth',
      },
    } as ArchiveBook;
  });

  it('removes .os-part-text', () => {
    expect(parseContents(book, book.tree.contents)[0].title).toEqual(
      '<span class="os-number">' +
        'D' +
      '</span>' +
      '<span class="os-divider"> | </span>' +
      '<span data-type="" itemprop="" class="os-text">Book title</span>');
  });

  it('removes .os-number and .os-divider if section is an unit', () => {
    expect(parseContents(book, book.tree.contents)[1].title).toEqual(
      '<span data-type="" itemprop="" class="os-text">The Chemistry of Life</span>');
  });

  it('handles unit that does not have .os-number and .os-divider', () => {
    expect(parseContents(book, book.tree.contents)[2].title).toEqual(
      '<span data-type="" itemprop="" class="os-text">The Chemistry of Life</span>');
  });

  it('doesn\'t add divider if it\'s not an appendix', () => {
    book.tree.contents = book.tree.contents.map(({title, ...rest}) => ({
      ...rest,
      title: title.replace(/appendix/i, 'something else'),
    })) as ArchiveTree['contents'];

    expect(parseContents(book, book.tree.contents)[0].title).toEqual(
      '<span class="os-number">' +
        'D' +
      '</span>' +
      '<span class="os-divider"> </span>' +
      '<span data-type="" itemprop="" class="os-text">Book title</span>');
  });
});

describe('getIdFromPageParam', () => {
  it('gets id from SlugParams', () => {
    expect(getIdFromPageParam({ slug: 'slug-id' })).toEqual('slug-id');
  });

  it('gets id from UuidParams', () => {
    expect(getIdFromPageParam({ uuid: 'uuid-id' })).toEqual('uuid-id');
  });

  it('return empty string for null', () => {
    expect(getIdFromPageParam(null)).toEqual('');
  });
});
