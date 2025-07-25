import { Highlight } from '@openstax/highlighter';
import { SearchResult } from '@openstax/open-search-client';
import { Document, HTMLDetailsElement, HTMLElement, HTMLAnchorElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import * as mathjax from '../../../helpers/mathjax';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../../test/MessageProvider';
import mockArchiveLoader, { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import { makeSearchResultHit, makeSearchResults } from '../../../test/searchResults';
import AccessibilityButtonsWrapper from '../../components/AccessibilityButtonsWrapper';
import * as Services from '../../context/Services';
import { scrollTo } from '../../domUtils';
import { locationChange, push } from '../../navigation/actions';
import { addToast } from '../../notifications/actions';
import { toastMessageKeys } from '../../notifications/components/ToastNotifications/constants';
import { AppServices, AppState, MiddlewareAPI, Store } from '../../types';
import { assertDocument, assertWindow } from '../../utils';
import * as actions from '../actions';
import { receivePage } from '../actions';
import { textResizerDefaultValue } from '../constants';
import { receiveHighlights } from '../highlights/actions';
import { initialState } from '../reducer';
import * as routes from '../routes';
import { receiveSearchResults, requestSearch, selectSearchResult } from '../search/actions';
import * as searchUtils from '../search/utils';
import * as select from '../selectors';
import { PageReferenceError, PageReferenceMap } from '../types';
import { formatBookData } from '../utils';
import ConnectedPage, { PageComponent } from './Page';
import PageNotFound from './Page/PageNotFound';
import allImagesLoaded from './utils/allImagesLoaded';

jest.mock('./utils/allImagesLoaded', () => jest.fn());
jest.mock('../highlights/components/utils/showConfirmation', () => () => new Promise((resolve) => resolve(false)));

jest.mock('../../../config.books', () => {
  const mockBook = (jest as any).requireActual('../../../test/mocks/archiveLoader').book;
  return { [mockBook.id]: { defaultVersion: mockBook.version } };
});

// https://github.com/facebook/jest/issues/936#issuecomment-463644784
jest.mock('../../domUtils', () => ({
  // remove cast to any when the jest type is updated to include requireActual()
  ...(jest as any).requireActual('../../domUtils'),
  scrollTo: jest.fn(),
}));

jest.mock('../../reactUtils', () => ({
  ...(jest as any).requireActual('../../reactUtils'),
  useMatchMobileQuery: jest.fn(),
}));

const makeClickEvent = () => {
  const event = new Event('click', { bubbles: true, cancelable: true });
  event.preventDefault();
  event.preventDefault = jest.fn();
  return event;
};

const makeToggleEvent = () => {
  const event = new Event('toggle', { bubbles: true, cancelable: true });
  event.preventDefault();
  event.preventDefault = jest.fn();
  return event;
};

const references: Array<PageReferenceMap | PageReferenceError> = [
  {
    match: '/content/link',
    params: {
      book: {
        slug: 'book-slug-1',
      } ,
      page: {
        slug: 'page-title',
      },
    },
  },
  {
    match: 'cross-book-reference-error',
    type: 'error',
  },
];

describe('Page', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;
  let rootComponent: HTMLElement | undefined;

  beforeEach(() => {
    (allImagesLoaded as any as jest.SpyInstance).mockReturnValue(Promise.resolve());

    store = createTestStore({
      content: {
        ...initialState,
        book: formatBookData(book, mockCmsBook),
        page: shortPage,
        textSize: textResizerDefaultValue,
      },
    });

    state = store.getState();

    const testServices = createTestServices({prefetchResolutions: true});

    services = {
      ...testServices,
      dispatch: store.dispatch,
      getState: store.getState,
    };
    dispatch = jest.spyOn(store, 'dispatch');
    archiveLoader = testServices.archiveLoader;
    rootComponent = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    unmountDom();
  });

  const renderDomHelper = ({topHeadingLevel}: {topHeadingLevel?: number} = {}) => {
    const result = renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <AccessibilityButtonsWrapper>
              <ConnectedPage topHeadingLevel={topHeadingLevel} />
            </AccessibilityButtonsWrapper>
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    rootComponent = result.root;

    return result;
  };

  const renderDomWithReferences = ({html, topHeadingLevel}: {html?: string, topHeadingLevel?: number} = {}) => {
    const pageWithRefereces = {
      ...page,
      content: html || `
        some text
        <a href="/content/link">some link</a>
        some more text
        <a href="./rando/link">another link</a>
        some more text
        text
        <button>asdf</button>
        text
        <a href="">link with empty href</a>
        <a href="#hash">hash link</a>
        <a href="cross-book-reference-error">reference loading error</a>
      `,
    };
    archiveLoader.mockPage(book, pageWithRefereces, 'unused?1');

    store.dispatch(receivePage({...pageWithRefereces, references }));

    return renderDomHelper({topHeadingLevel});
  };

  const unmountDom = () => {
    if (rootComponent) {
      ReactDOM.unmountComponentAtNode(rootComponent);
    }
  };

  describe('Content tweaks for assignable', () => {
    let pageElement: HTMLElement;

    const htmlHelper = async(html: string) => {
      const {root} = renderDomWithReferences({html, topHeadingLevel: 2});
      const query = root.querySelector<HTMLElement>('#main-content');

      if (!query) {
        return expect(query).toBeTruthy();
      }
      pageElement = query;

      // page lifecycle hooks
      await Promise.resolve();

      return pageElement.innerHTML;
    };

    it('changes heading levels when specified', async() => {
      expect(await htmlHelper('<h3>Largest heading</h3><h4>Second largest heading</h4>'))
        .toEqual('<h2>Largest heading</h2><h3>Second largest heading</h3>');
    });
  });

  describe('Content tweaks for generic styles', () => {
    let pageElement: HTMLElement;

    const htmlHelper = async(html: string) => {
      const {root} = renderDomWithReferences({html});
      const query = root.querySelector<HTMLElement>('#main-content');

      if (!query) {
        return expect(query).toBeTruthy();
      }
      pageElement = query;

      // page lifecycle hooks
      await Promise.resolve();

      return pageElement.innerHTML;
    };

    it('wraps note titles in a <header> and contents in a <section>', async() => {
      expect(await htmlHelper('<div data-type="note"><div data-type="title">TT</div><p>BB</p></div>'))
      .toEqual('<div data-type="note" class="ui-has-child-title">' +
      '<header><div data-type="title">TT</div></header><section><p>BB</p></section></div>');
    });

    it('adds a label to the note when present', async() => {
      expect(await htmlHelper('<div data-type="note" data-label="LL"><div data-type="title">notetitle</div></div>'))
      .toEqual('<div data-type="note" data-label="LL" class="ui-has-child-title">' +
      '<header><div data-type="title" data-label-parent="LL">notetitle</div></header>' +
      '<section></section></div>');
    });

    it('converts notes without titles', async() => {
      expect(await htmlHelper('<div data-type="note">notewithouttitle</div>'))
      .toEqual('<div data-type="note"><header></header><section>notewithouttitle</section></div>');
    });

    it('moves figure captions to the bottom', async() => {
      expect(await htmlHelper('<figure><figcaption>CC</figcaption>FF</figure>'))
      .toEqual('<figure class="ui-has-child-figcaption">FF<figcaption>CC</figcaption></figure>');
    });

    it('numbers lists that have a start attribute', async() => {
      expect(await htmlHelper('<ol start="123"><li>item</li></ol>'))
      .toEqual('<ol start="123" style="counter-reset: list-item 122"><li>item</li></ol>');
    });

    it('throws if the value for start is invalid', async() => {
      await expect(htmlHelper('<ol start="abc"><li>item</li></ol>')).rejects.toThrow();
    });

    it('adds prefix to list items', async() => {
      expect(await htmlHelper('<ol data-mark-prefix="[mark-prefix]"><li>item</li></ol>'))
      .toEqual('<ol data-mark-prefix="[mark-prefix]"><li data-mark-prefix="[mark-prefix]">item</li></ol>');
    });

    it('adds a suffix to list items', async() => {
      expect(await htmlHelper('<ol data-mark-suffix="[mark-suffix]"><li>item</li></ol>'))
      .toEqual('<ol data-mark-suffix="[mark-suffix]"><li data-mark-suffix="[mark-suffix]">item</li></ol>');
    });

    it('updates content self closing tags', async() => {
      expect(await htmlHelper(`<strong data-somethin="asdf"/>asdf<iframe src="/someplace"/>`)).toEqual(
        '<strong data-somethin="asdf"></strong>asdf<iframe src="/someplace"></iframe>'
      );
    });

    it('moves (first-child) figure and table ids up to the parent div', async() => {
      expect(await htmlHelper(`
        <div class="os-figure">
          <figure id="figure-id1">
            <span data-alt="Something happens." data-type="media" id="span-id1">
              <img alt="Something happens." data-media-type="image/png" id="img-id1" src="/resources/hash" width="300">
            </span>
          </figure>
          <div class="os-caption-container">
            <span class="os-title-label">Figure </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span class="os-caption">Some explanation about the image. (credit: someone)</span>
          </div>
        </div>

        <div class="os-table">
          <table summary="Table 1.1 Something" id="table-id1" class="some-class">
            <thead>
              <tr>
                <th scope="col"><strong>Column 1</strong></th>
                <th scope="col"><strong>Column 2</strong></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Value 1</td>
                <td>Value 2</td>
              </tr>
            </tbody>
          </table>
          <div class="os-caption-container">
            <span class="os-title-label">Table </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span data-type="title" class="os-title">Something</span>
            <span class="os-divider"> </span>
          </div>
        </div>
      `)).toEqual(`<div class="os-figure" id="figure-id1">
          <figure data-id="figure-id1">
            <span data-alt="Something happens." data-type="media" id="span-id1">
              <img alt="Something happens." data-media-type="image/png" id="img-id1" src="/resources/hash" width="300">
            </span>
          </figure>
          <div class="os-caption-container">
            <span class="os-title-label">Figure </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span class="os-caption">Some explanation about the image. (credit: someone)</span>
          </div>
        </div>

        <div class="os-table" id="table-id1">
          <table summary="Table 1.1 Something" data-id="table-id1" class="some-class">
            <thead>
              <tr>
                <th scope="col"><strong>Column 1</strong></th>
                <th scope="col"><strong>Column 2</strong></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Value 1</td>
                <td>Value 2</td>
              </tr>
            </tbody>
          </table>
          <div class="os-caption-container">
            <span class="os-title-label">Table </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span data-type="title" class="os-title">Something</span>
            <span class="os-divider"> </span>
          </div>
        </div>
      `);
    });

    describe('solutions', () => {
      it('are transformed', async() => {
        expect(await htmlHelper(`
          <div data-type="exercise" id="exercise1" data-element-type="check-understanding">
            <h3 class="os-title"><span class="os-title-label">Check Your Understanding</span></h3>
            <div data-type="problem" id="problem1"><div class="os-problem-container">
              <p id="paragraph1">blah blah blah</p>
            </div></div>
            <div data-type="solution" id="fs-id2913818" data-print-placement="here">
              <h4 data-type="title" class="solution-title"><span class="os-text">Solution</span></h4>
              <div class="os-solution-container">
                <p id="paragraph2">answer answer answer.</p>
              </div>
            </div>
          </div>
        `)).toEqual(`<div data-type="exercise" id="exercise1" data-element-type="check-understanding"` +
          ` class="ui-has-child-title">` +
          `<header><h3 class="os-title"><span class="os-title-label">Check Your Understanding</span></h3></header>` +
          `<section>
            ` + `
            <div data-type="problem" id="problem1"><div class="os-problem-container">
              <p id="paragraph1">blah blah blah</p>
            </div></div>
            <details `
              + `data-type="solution" `
              + `id="fs-id2913818" `
              + `data-print-placement="here" `
              + `aria-label="Show/Hide Solution"`
            + `>
        <summary class="btn-link ui-toggle" title="Show/Hide Solution" data-content="Show/Hide Solution"></summary>
        <section class="ui-body" role="alert">
              <h4 data-type="title" class="solution-title"><span class="os-text">Solution</span></h4>
              <div class="os-solution-container">
                <p id="paragraph2">answer answer answer.</p>
              </div>
            </section>
      </details>
          </section></div>
        `);
      });

      it('are not transformed if already formatted correctly', async() => {
        expect(
          await htmlHelper(`
          <div data-type="exercise" id="exercise1" data-element-type="check-understanding">
            <h3 class="os-title"><span class="os-title-label">Check Your Understanding</span></h3>
            <div data-type="problem" id="problem1"><div class="os-problem-container">
              <p id="paragraph1">blah blah blah</p>
            </div></div>
            <details data-type="solution" id="exercise1" data-element-type="check-understanding">
              <summary title="Show/Hide Solution" data-content="Show/Hide Solution">[Show/Hide Solution]</summary>
              <section class="ui-body" role="alert">
                <h2 data-type="solution-title">
                  <span class="os-title-label">Solution</span>
                </h2>
                <div class="os-solution-container">
                  <p id="paragraph2">answer answer answer.</p>
                </div>
              </section>
            </details>
          </div>`)
        ).toEqual(`<div data-type="exercise" id="exercise1" data-element-type="check-understanding" class="ui-has-child-title"><header><h3 class="os-title"><span class="os-title-label">Check Your Understanding</span></h3></header><section>
` + '            ' + `
            <div data-type="problem" id="problem1"><div class="os-problem-container">
              <p id="paragraph1">blah blah blah</p>
            </div></div>
            <details ` +
              `data-type="solution" ` +
              `id="exercise1" ` +
              `data-element-type="check-understanding"` +
              `>
              <summary title="Show/Hide Solution" data-content="Show/Hide Solution">[Show/Hide Solution]</summary>
              <section class="ui-body" role="alert">
                <h2 data-type="solution-title">
                  <span class="os-title-label">Solution</span>
                </h2>
                <div class="os-solution-container">
                  <p id="paragraph2">answer answer answer.</p>
                </div>
              </section>
            </details>
          </section></div>`);
      });

      it('doesn\'t use display none to hide solutions', async() => {
        if (!window) {
          return expect(window).toBeTruthy();
        }

        await htmlHelper(`
          <div data-type="exercise" id="exercise1" data-element-type="check-understanding">
            <h3 class="os-title"><span class="os-title-label">Check Your Understanding</span></h3>
            <div data-type="problem" id="problem1"><div class="os-problem-container">
              <p id="paragraph1">blah blah blah</p>
            </div></div>
            <div data-type="solution" id="fs-id2913818" data-print-placement="here">
              <h4 data-type="title" class="solution-title"><span class="os-text">Solution</span></h4>
              <div class="os-solution-container">
                <p id="paragraph2">answer answer answer.</p>
              </div>
            </div>
          </div>
        `);

        const solutionSection = pageElement.querySelector('#exercise1 .ui-body');

        if (!solutionSection) {
          return expect(solutionSection).toBeTruthy();
        }

        // one of the checks that rangy does when skipping text
        // https://github.com/timdown/rangy/wiki/Text-Range-Module#visible-text
        expect(window.getComputedStyle(solutionSection).display).toBe('block');
      });

      it('doesn\'t throw when badly formatted', async() => {
        await htmlHelper(`
          <div data-type="exercise" id="exercise1" data-element-type="check-understanding">
            <h3 class="os-title"><span class="os-title-label">Check Your Understanding</span></h3>
            <div data-type="problem" id="problem1"><div class="os-problem-container">
              <p id="paragraph1">blah blah blah</p>
            </div></div>
            <div data-type="solution" id="fs-id2913818" data-print-placement="here">
              <h4 data-type="title" class="solution-title"><span class="os-text">Solution</span></h4>
              <div class="os-solution-container">
                <p id="paragraph2">answer answer answer.</p>
              </div>
            </div>
          </div>
        `);

        const button = pageElement.querySelector('[data-type="solution"] > .ui-toggle');
        const solution = pageElement.querySelector('details[data-type="solution"]');

        if (!button || !solution) {
          return expect(false).toBe(true);
        }

        Object.defineProperty(button.parentElement, 'parentElement', {value: null, writable: true});
        expect(() => button.dispatchEvent(makeToggleEvent())).not.toThrow();
        Object.defineProperty(button, 'parentElement', {value: null, writable: true});
        expect(() => button.dispatchEvent(makeToggleEvent())).not.toThrow();
      });

      it('is automatically expanded if it contains a link anchor', async() => {
        if (!window) {
          return expect(window).toBeTruthy();
        }

        window.location.hash = 'paragraph';
        await htmlHelper(`
          <div data-type="exercise">
            <div data-type="solution">
              <p id="paragraph">answer</p>
            </div>
          </div>
        `);

        const details = pageElement.querySelector('[data-type="solution"]') as HTMLDetailsElement;
        expect(details.open).toBe(true);
      });

      it('is not expanded if it does not contain the link anchor', async() => {
        if (!window) {
          return expect(window).toBeTruthy();
        }

        window.location.hash = 'notfound';
        await htmlHelper(`
          <div data-type="exercise">
            <div data-type="solution">
              <p id="paragraph">answer</p>
            </div>
          </div>
        `);

        const details = pageElement.querySelector('[data-type="solution"]') as HTMLDetailsElement;
        expect(details.open).toBe(false);
      });
    });

    it('moves footnotes from the content to the bottom of page', async() => {
      const input = await htmlHelper('<div id="content">' +
        '<p>Some text <a href="#1" role="doc-noteref">1</a></p>' +
        '<aside id="1" role="doc-footnote">' +
          '<p><span data-type="footnote-number">1</span>Footnote text</p>' +
        '</aside>' +
      '</div>');
      const expectedOutput = '<div id="content">' +
        '<p>' +
          'Some text ' +
          '<sup id="footnote-ref1" data-type="footnote-number">' +
            '<a href="#1" role="doc-noteref" data-type="footnote-link">1</a>' +
          '</sup>' +
        '</p>' +
      '</div>' +
      '<div data-type="footnote-refs">' +
        '<h3 data-type="footnote-refs-title">Footnotes</h3>' +
        '<ul data-list-type="bulleted" data-bullet-style="none">' +
          '<li id="1" data-type="footnote-ref">' +
            '<a role="doc-backlink" href="#footnote-ref1">1</a>' +
            '<span data-type="footnote-ref-content">' +
              '<p>Footnote text</p>' +
            '</span>' +
          '</li>' +
        '</ul>' +
      '</div>';
      expect(input).toEqual(expectedOutput);
    });
  });

  it('updates content link with new hrefs', async() => {
    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const [firstLink, secondLink] = Array.from(root.querySelectorAll('#main-content a'));

    if (!firstLink || !secondLink) {
      expect(firstLink).toBeTruthy();
      expect(secondLink).toBeTruthy();
    }

    expect(firstLink.getAttribute('href')).toEqual('books/book-slug-1/pages/page-title');
    expect(secondLink.getAttribute('href')).toEqual('./rando/link');
  });

  it('interceptes clicking content links', async() => {
    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    dispatch.mockReset();
    const [firstLink, secondLink, thirdLink] = Array.from(root.querySelectorAll('#main-content a'));
    const button = root.querySelector('#main-content button');

    if (!document || !firstLink || !secondLink || !thirdLink || !button) {
      expect(document).toBeTruthy();
      expect(firstLink).toBeTruthy();
      expect(secondLink).toBeTruthy();
      expect(thirdLink).toBeTruthy();
      expect(button).toBeTruthy();
      return;
    }

    const evt1 = makeClickEvent();
    const evt2 = makeClickEvent();
    const evt3 = makeClickEvent();
    const evt4 = makeClickEvent();

    firstLink.dispatchEvent(evt1);
    secondLink.dispatchEvent(evt2);
    thirdLink.dispatchEvent(evt3);
    button.dispatchEvent(evt4);

    expect(evt1.preventDefault).toHaveBeenCalled();
    expect(evt2.preventDefault).not.toHaveBeenCalled();
    expect(evt3.preventDefault).not.toHaveBeenCalled();
    expect(evt4.preventDefault).not.toHaveBeenCalled();

    await new Promise((resolve) => defer(resolve));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(push({
      params: {
        book: {
          slug: 'book-slug-1',
        } ,
        page: {
          slug: 'page-title',
        },
      },
      route: routes.content,
      state: {},
    }, {
      hash: '',
      search: '',
    }));
  });

  it('interceptes clicking links that failed due to reference loading error', async() => {
    const {root} = renderDomWithReferences();

    const spyAlert = jest.spyOn(globalThis as any, 'alert')
      .mockImplementation(jest.fn());

    dispatch.mockReset();
    const [, , , , lastLink] = Array.from(root.querySelectorAll('#main-content a'));

    if (!document || !lastLink) {
      expect(document).toBeTruthy();
      expect(lastLink).toBeTruthy();
      return;
    }

    const event = makeClickEvent();
    lastLink.dispatchEvent(event);

    expect(event.preventDefault).not.toHaveBeenCalled();

    expect(spyAlert).toHaveBeenCalledWith('This link is broken because of a cross book content loading issue');

    await new Promise((resolve) => defer(resolve));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not reset search results when clicking content links to same book', async() => {
    const mockSearchResults = { hits: { hits: [] } } as any as SearchResult;
    store.dispatch(receiveSearchResults(mockSearchResults));
    expect(store.getState().content.search.results).toEqual(mockSearchResults);

    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const [firstLink] = Array.from(root.querySelectorAll('#main-content a'));

    if (!firstLink || !document) {
      return expect(firstLink).toBeTruthy();
    }

    const evt1 = makeClickEvent();

    firstLink.dispatchEvent(evt1);

    await new Promise((resolve) => defer(resolve));

    expect(dispatch).toHaveBeenCalledWith(push({
      params: {
        book: {
          slug: 'book-slug-1',
        },
        page: {
          slug: 'page-title',
        },
      },
      route: routes.content,
      state: {},
    }, {
      hash: '',
      search: '',
    }));
    expect(store.getState().content.search.results).toEqual(mockSearchResults);
  });

  it('does not reset search results when clicking hash links', async() => {
    const mockSearchResults = { hits: { hits: [] } } as any as SearchResult;
    store.dispatch(receiveSearchResults(mockSearchResults));
    expect(store.getState().content.search.results).toEqual(mockSearchResults);

    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const hashLink = root.querySelector('#main-content a[href="#hash"]');

    if (!hashLink || !document) {
      expect(document).toBeTruthy();
      return expect(hashLink).toBeTruthy();
    }

    const evt1 = makeClickEvent();

    hashLink.dispatchEvent(evt1);

    await new Promise((resolve) => defer(resolve));

    expect(dispatch).toHaveBeenCalledWith(push({
      params: expect.anything(),
      route: routes.content,
      state: expect.anything(),
    }, {
      hash: '#hash',
      search: '',
    }));
    expect(store.getState().content.search.results).toEqual(mockSearchResults);
  });

  it('passes search when clicking archive links', async() => {
    routes.content.getSearch = jest.fn().mockReturnValue('archive=some-content');

    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const archiveLink = root.querySelector('#main-content a[href=""]');

    if (!archiveLink || !document) {
      expect(document).toBeTruthy();
      return expect(archiveLink).toBeTruthy();
    }

    const evt1 = makeClickEvent();

    archiveLink.dispatchEvent(evt1);

    await new Promise((resolve) => defer(resolve));

    expect(dispatch).toHaveBeenCalledWith(receivePage(expect.objectContaining({ references })));
  });

  it('does not intercept clicking content links when meta key is pressed', async() => {
    const {root} = renderDomWithReferences();
    dispatch.mockReset();
    const [firstLink] = Array.from(root.querySelectorAll('#main-content a'));

    // rewrite this link href so that jsdom doesn't complain about the navigation
    (firstLink as HTMLAnchorElement).href = '#a-hash-link';

    if (!document || !firstLink) {
      expect(document).toBeTruthy();
      expect(firstLink).toBeTruthy();
      return;
    }

    const makeMetaEvent = (doc: Document) => {
      const event = doc.createEvent('MouseEvents');
      event.initMouseEvent('click',
        event.cancelBubble,
        event.cancelable,
        assertWindow(),
        event.detail,
        event.screenX,
        event.screenY,
        event.clientX,
        event.clientY,
        event.ctrlKey,
        event.altKey,
        event.shiftKey,
        true, // metaKey
        event.button,
        event.relatedTarget);
      event.preventDefault = jest.fn();

      return event;
    };

    const evt1 = makeMetaEvent(document);

    firstLink.dispatchEvent(evt1);

    await new Promise((resolve) => defer(resolve));

    expect(evt1.preventDefault).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('removes listener when it unmounts', async() => {
    const { root } = renderDomWithReferences();
    const links = Array.from(root.querySelectorAll('#main-content a'));

    for (const link of links) {
      link.removeEventListener = jest.fn();
    }

    // lifecycle hook
    await Promise.resolve();

    ReactDOM.unmountComponentAtNode(root);

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.removeEventListener).toHaveBeenCalled();
    }
  });

  it('doesn\'t break when trying to remove listeners from elements that have no stored handler', () => {
    const { root } = renderDomWithReferences();
    const pageElement = root.querySelector('#main-content');

    if (pageElement && document) {
      pageElement.append(document.createElement('a'));
      expect(() => ReactDOM.unmountComponentAtNode(root)).not.toThrow();
    } else {
      expect(pageElement).toBeTruthy();
      expect(document).toBeTruthy();
    }
  });

  it('doesn\'t break when selecting a highlight that failed to highlight', async() => {
    // ignore PageToasts timeout
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });

    const {root} = renderDomWithReferences();

    const hit = makeSearchResultHit({book, page});

    ReactTestUtils.act(() => {
      store.dispatch(requestSearch('asdf'));

      store.dispatch(receiveSearchResults(makeSearchResults([hit])));
      store.dispatch(selectSearchResult({result: hit, highlight: 0}));
    });

    // after images are loaded
    await new Promise((resolve) => setImmediate(resolve));

    ReactTestUtils.act(() => {
      // click again for selectedSearchResult to update
      store.dispatch(selectSearchResult({result: hit, highlight: 0}));
    });

    expect(scrollTo).not.toHaveBeenCalled();

    const button = root.querySelector('[data-testid=banner-body] button');

    if (!button) {
      return expect(button).toBeTruthy();
    }

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(button);
    });

    expect(root.querySelector('[data-testid=banner-body] button')).toBeFalsy();
  });

  it('scrolls to search result when selected', async() => {
    renderDomWithReferences();

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit = makeSearchResultHit({book, page});

    const highlightElement = assertDocument().createElement('span');
    const mockHighlight = {
      addFocusedStyles: jest.fn(),
      elements: [highlightElement],
    } as any as Highlight;

    highlightResults.mockReturnValue([
      {
        highlights: {0: [mockHighlight]},
        result: hit,
      },
    ]);

    store.dispatch(requestSearch('asdf'));

    store.dispatch(receiveSearchResults(makeSearchResults([hit])));
    store.dispatch(selectSearchResult({result: hit, highlight: 0}));

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockHighlight.addFocusedStyles).toHaveBeenCalled();
  });

  it('doesn\'t scroll to search result when selected but unchanged', async() => {
    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit1 = makeSearchResultHit({book, page});
    const hit2 = makeSearchResultHit({book, page});

    const highlightElement = assertDocument().createElement('span');
    const addFocusedStyles = jest.fn();
    const mockHighlight = {
      addFocusedStyles,
      elements: [highlightElement],
    } as any as Highlight;

    highlightResults.mockReturnValue([
      {
        highlights: {0: [mockHighlight]},
        result: hit1,
      },
      {
        highlights: {},
        result: hit2,
      },
    ]);

    store.dispatch(requestSearch('asdf'));

    store.dispatch(receiveSearchResults(makeSearchResults([hit1, hit2])));
    store.dispatch(selectSearchResult({result: hit1, highlight: 0}));

    renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();
    // after images are loaded
    await Promise.resolve();

    addFocusedStyles.mockClear();
    (scrollTo as any).mockClear();

    store.dispatch(receiveSearchResults(makeSearchResults([hit1])));

    expect(mockHighlight.addFocusedStyles).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to search result when selected before page navigation', async() => {
    renderDomWithReferences();

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit = makeSearchResultHit({book, page: shortPage});

    const highlightElement = assertDocument().createElement('span');
    const mockHighlight = {
      addFocusedStyles: jest.fn(),
      elements: [highlightElement],
    } as any as Highlight;

    highlightResults.mockReturnValue([
      {
        highlights: {},
        result: hit,
      },
    ]);

    store.dispatch(requestSearch('asdf'));
    store.dispatch(receiveSearchResults(makeSearchResults([hit])));
    store.dispatch(selectSearchResult({result: hit, highlight: 0}));

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    // make sure nothing happened
    expect(highlightResults).not.toHaveBeenCalled();
    expect(mockHighlight.addFocusedStyles).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();

    // do navigation
    highlightResults.mockReturnValue([
      {
        highlights: {0: [mockHighlight]},
        result: hit,
      },
    ]);
    store.dispatch(receivePage({...shortPage, references: []}));

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    expect(highlightResults).toHaveBeenCalledWith(expect.anything(), [hit]);
    expect(mockHighlight.addFocusedStyles).toHaveBeenCalled();
  });

  it('renders error modal for different search results', async() => {
    // ignore PageToasts timeout
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });

    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit1 = makeSearchResultHit({book, page});
    const hit2 = makeSearchResultHit({book, page});

    highlightResults.mockReturnValue([]);

    ReactTestUtils.act(() => {
      store.dispatch(requestSearch('asdf'));
      store.dispatch(receiveSearchResults(makeSearchResults([hit1, hit2])));
      store.dispatch(selectSearchResult({result: hit1, highlight: 0}));
    });

    // page lifecycle hooks
    await Promise.resolve();
    // after images are loaded
    await Promise.resolve();

    const errorModalCloseButton = root.querySelector('[data-testid=banner-body] button');

    if (!errorModalCloseButton) {
      return expect(errorModalCloseButton).toBeTruthy();
    }

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(errorModalCloseButton);
    });

    expect(root.querySelector('[data-testid=banner-body]')).toBeFalsy();

    ReactTestUtils.act(() => {
      store.dispatch(selectSearchResult({result: hit2, highlight: 0}));
    });

    // page lifecycle hooks
    await Promise.resolve();
    // after images are loaded
    await Promise.resolve();

    expect(root.querySelector('[data-testid=banner-body]')).toBeTruthy();
    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(errorModalCloseButton);
    });

    highlightResults.mockRestore();
  });

  it('doesn\'t render error modal for the same result twice', async() => {
    // ignore PageToasts timeout
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });

    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit = makeSearchResultHit({book, page});
    const searchResultToSelect = {result: hit, highlight: 0};

    highlightResults.mockReturnValue([]);

    ReactTestUtils.act(() => {
      store.dispatch(requestSearch('asdf'));
      store.dispatch(receiveSearchResults(makeSearchResults([hit])));
      store.dispatch(selectSearchResult(searchResultToSelect));
    });

    // page lifecycle hooks
    await Promise.resolve();
    // after images are loaded
    await Promise.resolve();

    const errorModalCloseButton = root.querySelector('[data-testid=banner-body] button');

    if (!errorModalCloseButton) {
      return expect(errorModalCloseButton).toBeTruthy();
    }

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(errorModalCloseButton);
    });

    expect(root.querySelector('[data-testid=banner-body]')).toBeFalsy();

    ReactTestUtils.act(() => {
      store.dispatch(selectSearchResult(searchResultToSelect));
    });

    // page lifecycle hooks
    await Promise.resolve();
    // after images are loaded
    await Promise.resolve();

    expect(root.querySelector('[data-testid=banner-body]')).toBeFalsy();
    highlightResults.mockRestore();
  });

  it('refresh error modal for different search results if they are of the same type', async() => {
    // ignore PageToasts timeout
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });
    const {root} = renderDomWithReferences();

    const dateMock = jest.spyOn(Date, 'now')
      .mockReturnValue(1);

    // page lifecycle hooks
    await Promise.resolve();

    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit1 = makeSearchResultHit({book, page});
    const hit2 = makeSearchResultHit({book, page});

    highlightResults.mockReturnValue([]);

    ReactTestUtils.act(() => {
      store.dispatch(requestSearch('asdf'));
      store.dispatch(receiveSearchResults(makeSearchResults([hit1, hit2])));
      store.dispatch(selectSearchResult({result: hit1, highlight: 0}));
    });

    // page lifecycle hooks
    await Promise.resolve();
    // after images are loaded
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(
      addToast(toastMessageKeys.search.failure.nodeNotFound, {destination: 'page'})
    );
    dispatch.mockClear();

    ReactTestUtils.act(() => {
      store.dispatch(selectSearchResult({result: hit2, highlight: 0}));
    });

    // page lifecycle hooks
    await Promise.resolve();
    // after images are loaded
    await Promise.resolve();

    expect(root.querySelector('[data-testid=banner-body]')).toBeTruthy();
    expect(dispatch).toHaveBeenCalledWith(
      addToast(toastMessageKeys.search.failure.nodeNotFound, {destination: 'page'})
    );

    highlightResults.mockRestore();
    dateMock.mockRestore();
  });

  it('renders error modal for highlight scroll target when it cant find a highlight - only once', async() => {
    // ignore PageToasts timeout
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });
    const mockScrollTarget = `target=${JSON.stringify({ type: 'highlight', id: 'some-id' })}`;

    const dateMock = jest.spyOn(Date, 'now')
      .mockReturnValue(1);

    const {root} = renderDomWithReferences();

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    ReactTestUtils.act(() => {
      store.dispatch(locationChange({
        action: 'REPLACE',
        location: { hash: 'does-not-matter', search: mockScrollTarget },
      } as any));
      store.dispatch(receiveHighlights({ highlights: [], pageId: page.id, }));
    });

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    expect(dispatch).toHaveBeenCalledWith(
      addToast(toastMessageKeys.highlights.failure.search, {destination: 'page'}));
    dispatch.mockClear();

    const errorModalCloseButton = root.querySelector('[data-testid=banner-body] button');

    if (!errorModalCloseButton) {
      return expect(errorModalCloseButton).toBeTruthy();
    }

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(errorModalCloseButton);
      store.dispatch(receiveHighlights({ highlights: [], pageId: page.id, }));
    });

    // page lifecycle hooks
    await new Promise((resolve) => setImmediate(resolve));

    expect(dispatch).not.toHaveBeenCalledWith(
      addToast(toastMessageKeys.highlights.failure.search, {destination: 'page'}));

    dateMock.mockRestore();
  });

  it('mounts, updates, and unmounts without a dom', async() => {
    const element = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <AccessibilityButtonsWrapper>
              <ConnectedPage />
            </AccessibilityButtonsWrapper>
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    renderer.act(() => {
      store.dispatch(receiveSearchResults(makeSearchResults()));
    });

    expect(() => element.unmount()).not.toThrow();
  });

  it('renders math', () => {
    const typesetMath = jest.spyOn(mathjax, 'typesetMath');
    renderDomWithReferences();
    expect(typesetMath).toHaveBeenCalled();
    typesetMath.mockRestore();
  });

  it('scrolls to top on new content', async() => {
    jest.useRealTimers();

    if (!window) {
      return expect(window).toBeTruthy();
    }

    const spy = jest.spyOn(window, 'scrollTo');
    spy.mockImplementation(() => null);

    renderDomWithReferences();

    store.dispatch(actions.receivePage({
      abstract: '',
      content: 'some other content',
      id: 'adsfasdf',
      references: [],
      revised: '2018-07-30T15:58:45Z',
      slug: 'mock-slug',
      title: 'qerqwer',
    }));

    await new Promise((resolve) => defer(resolve));

    expect(spy).toHaveBeenCalledWith(0, 0);
  });

  it('waits for images to load before scrolling to a target element', async() => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      abstract: '',
      content: '<div style="height: 1000px;"></div><img src=""><div id="somehash"></div>',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      slug: 'mock-slug',
      title: 'qerqwer',
    };

    state.navigation.hash = '#somehash';
    archiveLoader.mockPage(book, someHashPage, 'unused3');

    const {root} = renderDomWithReferences();

    let resolveImageLoaded: undefined | ((value?: void | PromiseLike<void> | undefined) => void);
    const allImagesLoadedPromise = new Promise<void>((resolve) => {
      resolveImageLoaded = resolve;
    });

    if (!resolveImageLoaded) {
      return expect(resolveImageLoaded).toBeTruthy();
    }

    (allImagesLoaded as any as jest.SpyInstance).mockReturnValue(allImagesLoadedPromise);

    store.dispatch(actions.receivePage({
      ...someHashPage,
      references: [],
    }));

    await Promise.resolve();
    await Promise.resolve();

    expect(scrollTo).not.toHaveBeenCalled();

    resolveImageLoaded();
    await Promise.resolve();

    const target = root.querySelector('[id="somehash"]');

    expect(target).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('does not scroll to selected content on initial load', () => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      abstract: '',
      content: '<div style="height: 1000px;"></div><div id="somehash"></div>',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      slug: 'mock-slug',
      title: 'qerqwer',
    };

    state.navigation.hash = '#somehash';
    state.content.page = someHashPage;

    archiveLoader.mockPage(book, someHashPage, 'unused?2');

    const {root} = renderDomHelper();

    const target = root.querySelector('[id="somehash"]');

    expect(target).toBeTruthy();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to selected content on update', async() => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      abstract: '',
      content: '<div style="height: 1000px;"></div><div id="somehash"></div>',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      slug: 'mock-slug',
      title: 'qerqwer',
    };

    state.navigation.hash = '#somehash';
    archiveLoader.mockPage(book, someHashPage, 'unused?3');

    const {root} = renderDomWithReferences();

    expect(scrollTo).not.toHaveBeenCalled();

    store.dispatch(actions.receivePage({
      ...someHashPage,
      references: [],
    }));

    // page lifecycle hooks
    await Promise.resolve();
    // previous processing
    await Promise.resolve();
    // images loaded
    await Promise.resolve();

    const target = root.querySelector('[id="somehash"]');

    expect(target).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('does nothing when receiving the same content', () => {
    if (!window) {
      return expect(window).toBeTruthy();
    }

    const spy = jest.spyOn(window, 'scrollTo');

    renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <AccessibilityButtonsWrapper>
                <ConnectedPage />
            </AccessibilityButtonsWrapper>
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    renderer.act(() => {
      store.dispatch(actions.receiveBook(formatBookData(book, mockCmsBook)));
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('does not focus main content on initial load', () => {
    state.content = initialState;

    const {tree} = renderDomHelper();
    const wrapper = ReactTestUtils.findRenderedComponentWithType(tree, PageComponent);

    if (!window) {
      expect(window).toBeTruthy();
    } else if (!wrapper) {
      expect(wrapper).toBeTruthy();
    } else {
      const mainContent = wrapper.container.current;

      if (!mainContent) {
        return expect(mainContent).toBeTruthy();
      }
      const spyFocus = jest.spyOn(mainContent, 'focus');
      expect(spyFocus).toHaveBeenCalledTimes(0);
    }
  });

  it('renders <PageNotFound> component', () => {
    jest.spyOn(select, 'pageNotFound')
      .mockReturnValue(true);

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <AccessibilityButtonsWrapper>
                <ConnectedPage />
            </AccessibilityButtonsWrapper>
          </MessageProvider>
        </Services.Provider>
      </Provider>);

    expect(component.root.findByType(PageNotFound)).toBeTruthy();
  });

  describe('with prerendered state', () => {
    beforeEach(() => {
      assertWindow().__PRELOADED_STATE__ = state;
    });

    afterEach(() => {
      delete assertWindow().__PRELOADED_STATE__;
    });

    it('uses prerendered content', () => {
      services.prerenderedContent = 'prerendered content';
      archiveLoader.mock.cachedPage.mockImplementation(() => undefined);

      const {root} = renderDomHelper();
      const target = root.querySelector('[id="main-content"]');

      if (!target) {
        return expect(target).toBeTruthy();
      }

      expect(target.innerHTML).toEqual('prerendered content');
    });

    it('defaults to empty page', () => {
      archiveLoader.mock.cachedPage.mockImplementation(() => undefined);

      const {root} = renderDomHelper();
      const target = root.querySelector('[id="main-content"]');

      if (!target) {
        return expect(target).toBeTruthy();
      }

      expect(target.innerHTML).toEqual('');
    });
  });
});
