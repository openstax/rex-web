import React from 'react';
import { Provider } from 'react-redux';
import ConnectedPage from '../';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import mockArchiveLoader, { book, page, shortPage } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../../test/reactutils';
import { makeSearchResultHit, makeSearchResults } from '../../../../../test/searchResults';
import SkipToContentWrapper from '../../../../components/SkipToContentWrapper';
import * as Services from '../../../../context/Services';
import { scrollTo } from '../../../../domUtils';
import MessageProvider from '../../../../MessageProvider';
import { locationChange } from '../../../../navigation/actions';
import { AppServices, MiddlewareAPI, Store } from '../../../../types';
import { assertDefined, assertWindow, assertDocument } from '../../../../utils';
import * as contentActions from '../../../actions';
import { initialState } from '../../../reducer';
import { content } from '../../../routes';
import { formatBookData } from '../../../utils';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { Highlight } from '@openstax/highlighter';
import * as searchUtils from '../../../search/utils';
import * as searchActions from '../../../search/actions';
import { createNavigationOptions } from '../../../../navigation/utils';

jest.mock('../../utils/allImagesLoaded', () => jest.fn(() => Promise.resolve()));
jest.mock('../../../../domUtils', () => ({
  ...jest.requireActual('../../../../domUtils'),
  scrollTo: jest.fn(),
}));

const scrollTarget = {
  elementId: 'id',
  index: 0,
  type: 'search',
};

const initialBook = formatBookData(book, mockCmsBook);
const initialPage = page;
const initialPageNode = assertDefined(
  findArchiveTreeNodeById(initialBook.tree, initialPage.id), 'Test page missing in test book'
);

const location = {
  hash: '',
  pathname: `/books/${initialBook.slug}/pages/${initialPageNode.slug}`,
  search: '',
  state: {
    bookUid: initialBook.id,
    bookVersion: initialBook.version,
    pageUid: initialPage.id,
  },
};

const locationParams = {
  book: {slug: initialBook.slug},
  page: {slug: initialPageNode.slug},
};

const createHighlight = () => {
  const highlightElement = assertDocument().createElement('span');
  highlightElement.id = scrollTarget.elementId;
  const mockHighlight = {
    elements: [highlightElement],
    focus: jest.fn(),
  } as any as Highlight;

  return {
    highlightElement,
    mockHighlight,
  };
};

describe('Page scrolling behavior', () => {
  let window: Window;
  let windowScrollSpy: jest.SpyInstance;

  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;

  beforeEach(() => {
    window = assertWindow();
    windowScrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => null);

    store = createTestStore({
      content: {
        ...initialState,
        params: {
          book: {slug: initialBook.slug},
          page: {slug: initialPageNode.slug},
        },
      },
      navigation: {
        ...location,
        query: {},
      },
    });

    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(store, 'dispatch');
  });

  const renderPage = async() => {
    const renderedPage = renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    store.dispatch(contentActions.receiveBook(initialBook));
    store.dispatch(contentActions.receivePage({...initialPage, references: []}));

    await loading();
    return renderedPage;
  };

  const loading = async() => {
    // Page lifecycle methods
    await Promise.resolve();
    // All images loaded
    await Promise.resolve();
  };

  it('scrolls to top on new content', async() => {
    await renderPage();
    expect(windowScrollSpy).toHaveBeenCalledWith(0, 0);

    store.dispatch(contentActions.receivePage({...shortPage, references: []}));

    await loading();
    expect(windowScrollSpy).toHaveBeenCalledTimes(2);
    expect(windowScrollSpy.mock.calls.every(([argA, argB]) => argA === 0 && argB === 0)).toBe(true);
  });

  it('scrolls to search result when selected', async() => {
    await renderPage();

    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit = makeSearchResultHit({book: initialBook, page: initialPage});

    const { mockHighlight, highlightElement } = createHighlight();

    highlightResults.mockReturnValue([
      {
        highlights: {0: [mockHighlight]},
        result: hit,
      },
    ]);

    store.dispatch(searchActions.requestSearch('asdf'));
    store.dispatch(searchActions.receiveSearchResults(makeSearchResults([hit])));
    store.dispatch(searchActions.selectSearchResult({result: hit, highlight: 0}));
    store.dispatch(locationChange({
      action: 'REPLACE',
      location: {
        ...location,
        ...createNavigationOptions({query: 'asdf'}, scrollTarget),
        hash: `#${scrollTarget.elementId}`,
      },
      match: { route: content, params: locationParams },
    }));

    await loading();
    // after images are checked again in scrollManager
    await Promise.resolve();

    expect(mockHighlight.focus).toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledWith(highlightElement);
  });

  // it('scrolls to search result when selected before page navigation', async() => {
  //   renderDomWithReferences();

  //   // page lifecycle hooks
  //   await Promise.resolve();

  //   const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
  //   const hit = makeSearchResultHit({book, page: shortPage});

  //   const highlightElement = assertDocument().createElement('span');
  //   highlightElement.id = scrollTarget.elementId;
  //   const mockHighlight = {
  //     elements: [highlightElement],
  //     focus: jest.fn(),
  //   } as any as Highlight;

  //   highlightResults.mockReturnValue([
  //     {
  //       highlights: {},
  //       result: hit,
  //     },
  //   ]);

  //   store.dispatch(requestSearch('asdf'));
  //   store.dispatch(receiveSearchResults(makeSearchResults([hit])));
  //   store.dispatch(selectSearchResult({result: hit, highlight: 0}));
  //   store.dispatch(locationChange({
  //     action: 'REPLACE',
  //     location: {
  //       ...location,
  //       ...createNavigationOptions({query: 'asdf'}, scrollTarget),
  //       hash: `#${scrollTarget.elementId}`,
  //     },
  //     match: { route: routes.content, params: locationParams },
  //   }));

  //   // page lifecycle hooks
  //   await Promise.resolve();
  //   // after images are loaded
  //   await Promise.resolve();
  //   // after images are checked again in scrollManager
  //   await Promise.resolve();

  //   // make sure nothing happened
  //   expect(highlightResults).toHaveBeenCalledWith(expect.anything(), []);
  //   expect(mockHighlight.focus).not.toHaveBeenCalled();
  //   expect(scrollTo).not.toHaveBeenCalled();

  //   // do navigation
  //   highlightResults.mockReturnValue([
  //     {
  //       highlights: {0: [mockHighlight]},
  //       result: hit,
  //     },
  //   ]);
  //   store.dispatch(receivePage({...shortPage, references: []}));

  //   // page lifecycle hooks
  //   await Promise.resolve();
  //   // previous processing
  //   await Promise.resolve();
  //   // after images are loaded
  //   await Promise.resolve();
  //   // after images are checked again in scrollManager
  //   await Promise.resolve();

  //   expect(mockHighlight.focus).toHaveBeenCalled();
  //   expect(scrollTo).toHaveBeenCalledWith(highlightElement);
  // });

  it('doesn\'t scroll to search result when selected but unchanged', async() => {
    const highlightResults = jest.spyOn(searchUtils, 'highlightResults');
    const hit1 = makeSearchResultHit({book, page});
    const hit2 = makeSearchResultHit({book, page});

    const { mockHighlight } = createHighlight();
    const focus = jest.spyOn(mockHighlight, 'focus');

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

    store.dispatch(searchActions.requestSearch('asdf'));
    store.dispatch(searchActions.receiveSearchResults(makeSearchResults([hit1, hit2])));
    store.dispatch(searchActions.selectSearchResult({result: hit1, highlight: 0}));
    store.dispatch(locationChange({
      action: 'REPLACE',
      location: {
        ...location,
        ...createNavigationOptions({query: 'asdf'}, scrollTarget),
        hash: `#${scrollTarget.elementId}`,
      },
      match: { route: content, params: locationParams },
    }));

    await renderPage();
    expect(focus).toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalled();

    focus.mockClear();
    (scrollTo as any).mockClear();

    // THIS DOESNT SEEM TO WORK
    store.dispatch(searchActions.receiveSearchResults(makeSearchResults([hit1])));

    expect(mockHighlight.focus).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
