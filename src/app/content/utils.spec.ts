import cloneDeep from 'lodash/fp/cloneDeep';
import { resetModules } from '../../test/utils';
import { ArchiveBook, ArchiveTree, Book } from './types';
import {
  getContentPageReferences,
  getIdFromPageParam,
  getPageIdFromUrlParam,
  parseContents,
  stripIdVersion,
  toRelativeUrl,
} from './utils';

describe('stripIdVersion', () => {
  it('strips ids', () => {
    expect(stripIdVersion('asdf@qwer')).toEqual('asdf');
  });

  it('doesn\'t break with no id', () => {
    expect(stripIdVersion('asdf')).toEqual('asdf');
  });
});

describe('getContentPageReferences', () => {
  it('works with no references in the content', () => {
    expect(getContentPageReferences('some cool content')).toEqual([]);
  });

  it('works with empty content', () => {
    expect(getContentPageReferences('')).toEqual([]);
  });

  it('ignores urls not in links', () => {
    expect(
      getContentPageReferences('asdfasdfasf /contents/as8s8xu9sdnjsd9 asdfadf')
    ).toEqual([]);
  });

  it('picks up basic content reference', () => {
    expect(
      getContentPageReferences('asdfasdfasf <a href="/contents/as8s8xu9sdnjsd9"></a> asdfadf')
    ).toEqual([
      {
        match: '/contents/as8s8xu9sdnjsd9',
        pageId: 'as8s8xu9sdnjsd9',
      },
    ]);
  });

  it('picks up multiple references', () => {
    expect(
      getContentPageReferences(`
      asdfa <a href="/contents/as8s8xu9sdnjsd9"></a> sdf
      <a href="/contents/9sdnjsd9"></a>
    `)
    ).toEqual([
      {
        match: '/contents/as8s8xu9sdnjsd9',
        pageId: 'as8s8xu9sdnjsd9',
      },
      {
        match: '/contents/9sdnjsd9',
        pageId: '9sdnjsd9',
      },
    ]);
  });

  it('picks up multiple rap links', () => {
    expect(
      getContentPageReferences(`
      asdfa <a href="./13ac107a-f15f-49d2-97e8-60ab2e3b519c@29.7:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a> sdf
      <a href="./13ac107a-f15f-49d2-97e8-60ab2e3b519c:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a>
    `)
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
        slug: 'book-slug',
        title: 'book',
      },
    }) as Book;
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
            ],
            id: 'unit@unit',
            title: unitHtml,
          },
          {
            contents: [
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
