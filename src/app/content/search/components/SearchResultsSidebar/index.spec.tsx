import { SearchResultHitSourceElementTypeEnum } from '@openstax/open-search-client';
import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import SearchResultsSidebar from '.';
import createTestStore from '../../../../../test/createTestStore';
import {
  book as archiveBook,
  page,
  pageInChapter,
  pageInOtherChapter
} from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import {
  makeEvent,
  makeFindByTestId,
  makeFindOrNullByTestId,
  renderToDom
} from '../../../../../test/reactutils';
import {
  makeSearchResultHit,
  makeSearchResults
} from '../../../../../test/searchResults';
import TestContainer from '../../../../../test/TestContainer';
import { runHooks } from '../../../../../test/utils';
import * as selectNavigation from '../../../../navigation/selectors';
import { Store } from '../../../../types';
import { assertDocument, assertWindow } from '../../../../utils';
import { receiveBook, receivePage } from '../../../actions';
import { formatBookData } from '../../../utils';
import * as domUtils from '../../../utils/domUtils';
import {
  clearSearch,
  closeSearchResultsMobile,
  receiveSearchResults,
  requestSearch,
  selectSearchResult
} from '../../actions';
import * as selectSearch from '../../selectors';
import { SearchScrollTarget } from '../../types';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';
import { HTMLDivElement } from '@openstax/types/lib.dom';

describe('SearchResultsSidebar', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  const animationEvent = () => {
    return new (assertWindow().Event)('webkitAnimationEnd');
  };

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    store.dispatch(receiveBook(formatBookData(archiveBook, mockCmsBook)));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const render = () => (
    <TestContainer store={store}>
      <SearchResultsSidebar/>
    </TestContainer>
  );

  it('mounts and unmounts without a dom', () => {
    store.dispatch(requestSearch('cool search'));
    const component = renderer.create(render());
    expect(() => component.unmount()).not.toThrow();
  });

  it('mounts and unmmounts with a dom', () => {
    store.dispatch(requestSearch('cool search'));
    const { root } = renderToDom(render());
    expect(() => unmountComponentAtNode(root)).not.toThrow();
  });

  it('is initially null when there is no search', () => {
    const component = renderer.create(render());
    const findById = makeFindOrNullByTestId(component.root);

    expect(findById('search-results-sidebar')).toBe(null);
    component.unmount();
  });

  it('is hidden after search is cleared', () => {
    const component = renderer.create(render());

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
    });
    renderer.act(() => {
      store.dispatch(clearSearch());
    });

    const findById = makeFindByTestId(component.root);

    expect(findById('search-results-sidebar').props.searchResultsOpen).toBe(false);
    component.unmount();
  });

  it('shows sidebar with loading state if there is a search', () => {
    jest.spyOn(selectNavigation, 'persistentQueryParameters').mockReturnValue({query: 'cool search'});
    store.dispatch(requestSearch('cool search'));
    const component = renderer.create(render());
    const findById = makeFindByTestId(component.root);

    expect(() => findById('loader')).not.toThrow();
    expect(component.toJSON()).toMatchSnapshot();
    component.unmount();
  });

  it('matches snapshot for no search results', () => {
    jest.spyOn(selectNavigation, 'persistentQueryParameters').mockReturnValue({query: 'cool search'});

    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults([])));

    const component = renderer.create(render());
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component.unmount();
  });

  it('matches snapshot with results', () => {
    jest.spyOn(selectNavigation, 'persistentQueryParameters').mockReturnValue({query: 'cool search'});
    store.dispatch(receivePage({ ...pageInChapter, references: [] }));
    store.dispatch(requestSearch('cool search'));
    const selectedResult = makeSearchResultHit({ book: archiveBook, page });

    store.dispatch(
      receiveSearchResults(
        makeSearchResults([
          selectedResult,
          makeSearchResultHit({ book: archiveBook, page: pageInChapter }),
          makeSearchResultHit({ book: archiveBook, page: pageInOtherChapter }),
        ])
      )
    );
    store.dispatch(selectSearchResult({result: selectedResult, highlight: 0}));

    const component = renderer.create(render());
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component.unmount();
  });

  it('matches snapshot with related key terms', async() => {
    store.dispatch(receivePage({ ...pageInChapter, references: [] }));
    store.dispatch(requestSearch('term'));
    const selectedResult = makeSearchResultHit({
      book: archiveBook,
      elementType: SearchResultHitSourceElementTypeEnum.KeyTerm,
      highlights: ['description 1'],
      page,
      sourceId: 'test-pair-page1',
      title: 'term1 - selected',
    });
    const otherResult = makeSearchResultHit({
      book: archiveBook,
      elementType: SearchResultHitSourceElementTypeEnum.KeyTerm,
      highlights: ['description 2'],
      page: pageInChapter,
      sourceId: 'test-pair-page6',
      title: 'term2',
    });

    const component = renderer.create(render());

    await renderer.act(async() => {
      store.dispatch(
        receiveSearchResults(
          makeSearchResults([
            selectedResult,
            otherResult,
            makeSearchResultHit({ book: archiveBook, page: pageInOtherChapter }),
          ])
        )
      );
      await Promise.resolve();
    });

    await renderer.act(async() => {
      store.dispatch(selectSearchResult({result: selectedResult, highlight: 0}));
      await Promise.resolve();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    component.unmount();
  });

  it('closes mobile search results when related key term is clicked', async() => {
    store.dispatch(receivePage({ ...pageInChapter, references: [] }));
    store.dispatch(requestSearch('term'));

    const component = renderer.create(render());

    await renderer.act(async() => {
      store.dispatch(
        receiveSearchResults(
          makeSearchResults([
            makeSearchResultHit({
              book: archiveBook,
              elementType: SearchResultHitSourceElementTypeEnum.KeyTerm,
              highlights: ['descritpion'],
              sourceId: 'test-pair-page6',
              page: pageInChapter,
              title: 'term',
            }),
          ])
        )
      );

      await Promise.resolve();
    });

    const findById = makeFindByTestId(component.root);

    renderer.act(() => {
      expect(dispatch).not.toHaveBeenCalledWith(closeSearchResultsMobile());
    });

    await renderer.act(async() => {
      findById('related-key-term-result').props.onClick(makeEvent());
      await Promise.resolve();
    });

    expect(dispatch).toHaveBeenCalledWith(closeSearchResultsMobile());
  });

  it('doesn\'t move focus when loading without results', () => {
    const activeElement = assertDocument().activeElement;
    renderToDom(render());

    expect(assertDocument().activeElement).toBe(activeElement);

    ReactTestUtils.act(() => {
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults([])));
    });

    expect(assertDocument().activeElement).toBe(activeElement);
  });

  it('closes search results when one is clicked', () => {
    jest.useFakeTimers();
    store.dispatch(requestSearch('cool search'));
    store.dispatch(
      receiveSearchResults(
        makeSearchResults([makeSearchResultHit({ book: archiveBook, page })])
      )
    );

    const component = renderer.create(render());
    const findById = makeFindByTestId(component.root);

    expect(dispatch).not.toHaveBeenCalledWith(closeSearchResultsMobile());

    renderer.act(() => {
      findById('search-result').props.onClick(makeEvent());
      jest.runAllTimers();
    });

    expect(dispatch).toHaveBeenCalledWith(closeSearchResultsMobile());
  });

  it('clears search when closed', () => {
    store.dispatch(requestSearch('cool search'));
    store.dispatch(
      receiveSearchResults(
        makeSearchResults([makeSearchResultHit({ book: archiveBook, page })])
      )
    );

    const component = renderer.create(render());
    const findById = makeFindByTestId(component.root);

    expect(dispatch).not.toHaveBeenCalledWith(clearSearch());

    renderer.act(() => {
      findById('close-search').props.onClick(makeEvent());
    });

    expect(dispatch).toHaveBeenCalledWith(clearSearch());
  });

  // This is purely a code coverage test.
  // It should have a selected result that receives focus when the bar is focused,
  // and when the button is focused, it should keep it.
  it('sidebar tries to forward focus to current search result', () => {
    jest.spyOn(selectNavigation, 'persistentQueryParameters').mockReturnValue({query: 'cool search'});
    renderToDom(render());
    ReactTestUtils.act(() => {
      store.dispatch(receivePage({ ...pageInChapter, references: [] }));
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults([])));
    });

    const document = assertDocument();
    const bar = document.querySelector<HTMLDivElement>('[class*="SearchResultsBar"]');
    const button = document.querySelector('button');

    ReactTestUtils.act(() => bar?.focus());
    expect(document.activeElement).toBe(bar);

    ReactTestUtils.act(() => button?.focus());
    expect(document.activeElement).toBe(button);
  });

  it('scrolls to search scroll target if result selected by user', () => {
    const searchResult = makeSearchResultHit({ book: archiveBook, page });
    const searchScrollTarget: SearchScrollTarget = { type: 'search', index: 0, elementId: 'elementId' };
    const scrollSidebarSectionIntoView = jest.spyOn(domUtils, 'scrollSidebarSectionIntoView');
    jest.spyOn(selectSearch, 'userSelectedResult').mockReturnValue(true);

    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults([searchResult]), { searchScrollTarget }));
    store.dispatch(selectSearchResult({result: searchResult, highlight: 0}));

    renderer.create(render());

    renderer.act(() => {
      runHooks(renderer);
    });

    expect(scrollSidebarSectionIntoView).toHaveBeenCalledTimes(1);
  });

  it('scrolls to search scroll target if result selected by user after render', () => {
    const searchResult = makeSearchResultHit({ book: archiveBook, page });
    const searchScrollTarget: SearchScrollTarget = { type: 'search', index: 0, elementId: 'elementId' };
    const scrollSidebarSectionIntoView = jest.spyOn(domUtils, 'scrollSidebarSectionIntoView');
    jest.spyOn(selectSearch, 'userSelectedResult').mockReturnValue(true);

    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults([searchResult]), { searchScrollTarget }));

    renderer.create(render());

    expect(scrollSidebarSectionIntoView).toHaveBeenCalledTimes(1);

    renderer.act(() => {
      store.dispatch(selectSearchResult({result: searchResult, highlight: 0}));
    });

    renderer.act(() => {
      runHooks(renderer);
    });

    expect(scrollSidebarSectionIntoView).toHaveBeenCalledTimes(2);
  });

  it('fixes overscroll in safari', () => {
    const {tree} = renderToDom(render());
    const fixForSafariMock = jest.spyOn(domUtils, 'fixSafariScrolling');
    const firstResult = makeSearchResultHit({ book: archiveBook, page });
    const secondResult = makeSearchResultHit({ book: archiveBook, page: pageInChapter });

    ReactTestUtils.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults([firstResult, secondResult])));
      store.dispatch(selectSearchResult({result: firstResult, highlight: 0}));
      store.dispatch(selectSearchResult({result: secondResult, highlight: 0}));
    });

    const sidebar = ReactTestUtils.findRenderedComponentWithType(tree, SearchResultsBarWrapper);

    ReactTestUtils.act(() => {
      jest.useFakeTimers();
      if (sidebar.searchSidebar.current) {
        sidebar.searchSidebar.current.dispatchEvent(animationEvent());
      }
      jest.runAllTimers();
    });

    expect(fixForSafariMock).toHaveBeenCalled();
  });
});
