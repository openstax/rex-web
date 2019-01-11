import { HTMLElement } from '@openstax/types/lib.dom';
import cloneDeep from 'lodash/cloneDeep';
import { ArchiveTree, Book } from './types';
import {
  getContentPageReferences,
  getPageIdFromUrlParam,
  scrollTocSectionIntoView,
  stripIdVersion
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

  it('picks up basic content reference', () => {
    expect(
      getContentPageReferences('asdfasdfasf /contents/as8s8xu9sdnjsd9 asdfadf')
    ).toEqual([
      {
        bookUid: undefined,
        bookVersion: undefined,
        match: '/contents/as8s8xu9sdnjsd9',
        pageUid: 'as8s8xu9sdnjsd9',
      },
    ]);
  });

  it('picks up book content reference', () => {
    expect(
      getContentPageReferences('asdfasdfasf /contents/as8s8xu:9sdnjsd9 asdfadf')
    ).toEqual([
      {
        bookUid: 'as8s8xu',
        bookVersion: undefined,
        match: '/contents/as8s8xu:9sdnjsd9',
        pageUid: '9sdnjsd9',
      },
    ]);
  });

  it('picks up versioned book content reference', () => {
    expect(
      getContentPageReferences(
        'asdfasdfasf /contents/as8s8xu@1.2:9sdnjsd9 asdfadf'
      )
    ).toEqual([
      {
        bookUid: 'as8s8xu',
        bookVersion: '1.2',
        match: '/contents/as8s8xu@1.2:9sdnjsd9',
        pageUid: '9sdnjsd9',
      },
    ]);
  });

  it('picks up multiple references', () => {
    expect(
      getContentPageReferences(`
      asdfa /contents/as8s8xu9sdnjsd9 sdf
      /contents/as8s8xu:9sdnjsd9
      asf /contents/as8s8xu@1.2:9sdnjsd9 asdfadf
    `)
    ).toEqual([
      {
        bookUid: undefined,
        bookVersion: undefined,
        match: '/contents/as8s8xu9sdnjsd9',
        pageUid: 'as8s8xu9sdnjsd9',
      },
      {
        bookUid: 'as8s8xu',
        bookVersion: undefined,
        match: '/contents/as8s8xu:9sdnjsd9',
        pageUid: '9sdnjsd9',
      },
      {
        bookUid: 'as8s8xu',
        bookVersion: '1.2',
        match: '/contents/as8s8xu@1.2:9sdnjsd9',
        pageUid: '9sdnjsd9',
      },
    ]);
  });
});

describe('scrollTocSectionIntoView', () => {
  let activeSection: HTMLElement;
  let activeChapter: HTMLElement;
  let sidebar: HTMLElement;

  beforeEach(() => {
    if (!document) {
      throw new Error('jsdom...');
    }
    activeSection = document.createElement('li');
    activeChapter = document.createElement('li');
    sidebar = document.createElement('div');

    Object.defineProperty(sidebar, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(sidebar, 'offsetHeight', {
      value: 1000,
      writable: true,
    });
  });

  it('does nothing if activeSection is undefined', () => {
    scrollTocSectionIntoView(sidebar, undefined);
    expect(sidebar.scrollTop).toBe(0);
  });

  it('does nothing if sidebar is undefined', () => {
    expect(() =>
      scrollTocSectionIntoView(undefined, activeSection)
    ).not.toThrow();
  });

  it('does nothing if section is already visible', () => {
    Object.defineProperty(activeSection, 'offsetTop', { value: 500 });
    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(0);
  });

  it('udpates scroll position if the section is not visible', () => {
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1500);
  });

  it('udpates scroll position to the chapter heading if its available and it fits', () => {
    Object.defineProperty(activeChapter, 'offsetTop', { value: 1400 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: activeChapter,
    });

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1400);
  });

  it('udpates scroll position to the section heading if the chapter is too long', () => {
    Object.defineProperty(activeChapter, 'offsetTop', { value: 1000 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 2500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: activeChapter,
    });

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(2500);
  });

  it('searches through multiple levels to find the chapter', () => {
    if (!document) {
      throw new Error('jsdom...');
    }
    const randoElement1 = document.createElement('div');
    const randoElement2 = document.createElement('div');

    Object.defineProperty(activeChapter, 'offsetTop', { value: 1400 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: randoElement2,
    });
    Object.defineProperty(randoElement2, 'parentElement', {
      value: randoElement1,
    });
    Object.defineProperty(randoElement1, 'parentElement', {
      value: activeChapter,
    });

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1400);
  });

  it('stops searching when it finds the sidebar', () => {
    if (!document) {
      throw new Error('jsdom...');
    }
    const randoElement1 = document.createElement('div');
    const randoElement2 = document.createElement('div');

    Object.defineProperty(activeChapter, 'offsetTop', { value: 1400 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: randoElement2,
    });
    Object.defineProperty(randoElement2, 'parentElement', {
      value: randoElement1,
    });
    Object.defineProperty(randoElement1, 'parentElement', { value: sidebar });
    Object.defineProperty(sidebar, 'parentElement', { value: activeChapter });

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1500);
  });
});

describe('getUrlParamForPageId', () => {
  let book: Book;
  let getUrlParamForPageId: any;

  beforeEach(() => {
    jest.resetModules();
    getUrlParamForPageId = require('./utils').getUrlParamForPageId;

    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            shortId: 'page@1',
            title: '<span class="os-text">Preface</span>',
          },
        ],
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

  it('works with section numbers', () => {
    book.tree.contents[0].title =
      '<span class="os-number">2.1</span><span class="os-divider"> </span><span class="os-text">Section 1</span>';
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual('2-1-section-1');
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual('2-1-section-1');
  });

  it('works with multiple spaces in the section name', () => {
    book.tree.contents[0].title =
      '<span class="os-text">Section   asdf qwer</span>';
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual(
      'section-asdf-qwer'
    );
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual(
      'section-asdf-qwer'
    );
  });

  it('replaces wonky characters', () => {
    book.tree.contents[0].title = '<span class="os-text">Sèctĭꝋn</span>';
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual('section');
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual('section');
  });

  it('defaults section number to chapter number', () => {
    book.tree.contents[0].title =
      '<span class="os-number">2</span><span class="os-divider"> </span><span class="os-text">Chapter 2</span>';
    (book.tree.contents[0] as ArchiveTree).contents = [
      {
        id: 'somepagelongid@1',
        shortId: 'somepage@1',
        title: '<span class="os-text">a page</span>',
      },
    ];
    expect(getUrlParamForPageId(book, 'somepagelongid')).toEqual('2-a-page');
    expect(getUrlParamForPageId(book, 'somepagelongid@1')).toEqual('2-a-page');
  });

  it('replaces all spece delimitiers with a single dash', () => {
    book.tree.contents[0].title =
      '<span class="os-text">Section asdf __qwer-asdf</span>';
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual(
      'section-asdf-qwer-asdf'
    );
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual(
      'section-asdf-qwer-asdf'
    );
  });

  it('throws on empty title', () => {
    book.tree.contents[0].title = '';
    expect(() =>
      getUrlParamForPageId(book, 'pagelongid')
    ).toThrowErrorMatchingInlineSnapshot(
      `"BUG: could not URL encode page title: \\"\\""`
    );
  });

  it('throws on title with only numbers', () => {
    book.tree.contents[0].title = '34.2';
    expect(() =>
      getUrlParamForPageId(book, 'pagelongid')
    ).toThrowErrorMatchingInlineSnapshot(
      `"BUG: could not URL encode page title: \\"34.2\\""`
    );
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
            title: '<span class="os-text">Preface</span>',
          },
        ],
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
