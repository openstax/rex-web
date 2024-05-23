import React from 'react';
import { Provider } from 'react-redux';
import renderer, { TestRendererOptions } from 'react-test-renderer';
import Topbar from '.';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import {
  makeEvent,
  makeFindByTestId,
  makeFindOrNullByTestId,
  makeInputEvent,
  dispatchKeyDownEvent,
  renderToDom,
} from '../../../../test/reactutils';
import { act } from 'react-dom/test-utils';
import { makeSearchResults } from '../../../../test/searchResults';
import TestContainer from '../../../../test/TestContainer';
import * as Services from '../../../context/Services';
import { MiddlewareAPI, Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { openMobileMenu, setTextSize } from '../../actions';
import { textResizerMaxValue, textResizerMinValue } from '../../constants';
import { HTMLElement } from '@openstax/types/lib.dom';
import { searchKeyCombination } from '../../highlights/constants';
import {
  clearSearch,
  closeSearchResultsMobile,
  openSearchResultsMobile,
  receiveSearchResults,
  requestSearch
} from '../../search/actions';
import * as searchSelectors from '../../search/selectors';
import { formatBookData } from '../../utils';
import { CloseButtonNew, MenuButton, MobileSearchWrapper, SearchButton, TextResizerMenu } from './styled';
import { useMatchMobileQuery } from '../../../reactUtils';

const book = formatBookData(archiveBook, mockCmsBook);

jest.mock('../../../reactUtils', () => ({
  ...(jest as any).requireActual('../../../reactUtils'),
  useMatchMobileQuery: jest.fn(),
}));

describe('search', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
  });

  const render = (options?: TestRendererOptions) => renderer.create(<Provider store={store}>
    <Services.Provider value={services}>
      <MessageProvider>
        <Topbar />
      </MessageProvider>
    </Services.Provider>
  </Provider>, options);

const dispatchSearchShortcut = (target: HTMLElement | undefined) => {
  dispatchKeyDownEvent({code: searchKeyCombination.code, altKey: searchKeyCombination.altKey, target});
};

  it('opens and closes mobile interface', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);
    const mobileSearch = component.root.findByType(MobileSearchWrapper);

    const event = makeEvent();

    renderer.act(() => {
      findById('mobile-toggle').props.onClick(event);
    });
    expect(mobileSearch.props.mobileToolbarOpen).toBe(true);
    renderer.act(() => {
      findById('mobile-toggle').props.onClick(event);
    });
    expect(mobileSearch.props.mobileToolbarOpen).toBe(false);
    expect(event.preventDefault).toHaveBeenCalledTimes(2);

  });

  it('goes between main and search input when no search results', () => {
    const {node} = renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Topbar />
            <main tabIndex={-1} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const tb = node.querySelector<HTMLElement>('[class*="TopBar"]');

    expect(document?.activeElement?.tagName).toBe('INPUT');
    act(() => dispatchSearchShortcut(tb!));
    expect(document?.activeElement?.tagName).toBe('MAIN');
  });

  it('goes to search results when provided', () => {
    const {node} = renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Topbar />
            <div className='SearchResultsBar' tabIndex={-1} />
            <main tabIndex={-1} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const tb = node.querySelector<HTMLElement>('[class*="TopBar"]');

    store.dispatch(receiveSearchResults(makeSearchResults()));

    act(() => dispatchSearchShortcut(tb!));
    expect(document?.activeElement?.tagName).toBe('INPUT');
    act(() => dispatchSearchShortcut(tb!));
    expect(document?.activeElement?.classList.contains('SearchResultsBar')).toBe(true);
  });

  it('aborts on mobile', () => {
    (useMatchMobileQuery as jest.Mock).mockReturnValue(true);
    const {node} = renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Topbar />
            <main tabIndex={-1} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const tb = node.querySelector<HTMLElement>('[class*="TopBar"]');

    act(() => dispatchSearchShortcut(tb!));
    expect(document?.activeElement?.tagName).toBe('INPUT');
    act(() => dispatchSearchShortcut(tb!));
    expect(document?.activeElement?.tagName).not.toBe('MAIN');
  });

  it('doesn\'t dispatch search for empty string', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('');
    renderer.act(() => {
      findById('desktop-search-input').props.onChange(inputEvent);
    });

    const event = makeEvent();
    renderer.act(() => {
      findById('desktop-search').props.onSubmit(event);
    });
    expect(event.preventDefault).toHaveBeenCalled();

    expect(dispatch).not.toHaveBeenCalledWith(requestSearch('cool search'));
  });

  it('loads search query into text input', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    expect(findById('desktop-search-input').props.value).toEqual('');
    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
    });
    expect(findById('desktop-search-input').props.value).toEqual('cool search');
  });

  it('tries to blur the focused element on submit', () => {
    const component = render();
    const document = assertDocument();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('desktop-search-input').props.onChange(inputEvent);
    });

    const htmlelement = document.createElement('div');
    Object.defineProperty(document, 'activeElement', {value: htmlelement, writable: true});
    const blur1 = jest.spyOn(htmlelement, 'blur');
    renderer.act(() => findById('desktop-search').props.onSubmit(makeEvent()));
    expect(blur1).toHaveBeenCalled();

    // test non HTMLElement branch
    const svgelement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    Object.defineProperty(document, 'activeElement', {value: svgelement});
    const blur2 = jest.spyOn(svgelement, 'blur');
    renderer.act(() => findById('desktop-search').props.onSubmit(makeEvent()));
    expect(blur2).not.toHaveBeenCalled();
  });

  it('search and clear work on desktop', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('desktop-search-input').props.onChange(inputEvent);
    });

    const event = makeEvent();
    renderer.act(() => findById('desktop-search').props.onSubmit(event));
    expect(event.preventDefault).toHaveBeenCalled();

    renderer.act(() => {
      expect(dispatch).toHaveBeenCalledWith(requestSearch('cool search'));
    });

    expect(findById('desktop-search-input').props.value).toEqual('cool search');

    const clearClick = makeEvent();
    renderer.act(() => {
      findById('desktop-clear-search').props.onClick(clearClick);
    });
    expect(clearClick.preventDefault).toHaveBeenCalled();

    expect(findById('desktop-search-input').props.value).toEqual('');
  });

  it('search and clear work on mobile', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    renderer.act(() => {
      findById('mobile-toggle').props.onClick(makeEvent());
    });

    const inputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('mobile-search-input').props.onChange(inputEvent);
    });

    const event = makeEvent();
    renderer.act(() => findById('mobile-search').props.onSubmit(event));
    expect(event.preventDefault).toHaveBeenCalled();

    renderer.act(() => {
      expect(dispatch).toHaveBeenCalledWith(requestSearch('cool search'));
    });

    expect(findById('mobile-search-input').props.value).toEqual('cool search');

    const clearClick = makeEvent();
    renderer.act(() => {
      findById('mobile-clear-search').props.onClick(clearClick);
    });
    expect(clearClick.preventDefault).toHaveBeenCalled();

    expect(findById('mobile-search-input').props.value).toEqual('');
  });

  it('shows the "back to results" link after selecting a result', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);
    const findOrNull = makeFindOrNullByTestId(component.root);

    expect(findOrNull('back-to-search-results')).toBe(null);

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
      store.dispatch(closeSearchResultsMobile());
    });

    expect(findById('back-to-search-results')).toBeTruthy();
  });

  it('clicking "back to results" opens results', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
      store.dispatch(closeSearchResultsMobile());
    });

    expect(dispatch).not.toHaveBeenCalledWith(openSearchResultsMobile());

    renderer.act(() => {
      findById('back-to-search-results').props.onClick(makeEvent());
    });

    expect(dispatch).toHaveBeenCalledWith(openSearchResultsMobile());
  });

  it('clicking "Close" clears search results', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
    });

    renderer.act(() => {
      findById('close-search-results').props.onClick(makeEvent());
    });

    expect(dispatch).toHaveBeenCalledWith(clearSearch());
  });

  it('input value syncs between mobile and desktop', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const desktopInputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('desktop-search-input').props.onChange(desktopInputEvent);

      findById('mobile-toggle').props.onClick(makeEvent());
    });

    expect(findById('mobile-search-input').props.value).toEqual('cool search');
    const inputEvent = makeInputEvent('asdf');
    renderer.act(() => {
      findById('mobile-search-input').props.onChange(inputEvent);

      findById('mobile-toggle').props.onClick(makeEvent());
    });

    expect(findById('desktop-search-input').props.value).toEqual('asdf');
  });

  it('hides on desktop when a feature flag moves it to the sidebar', () => {
    jest.spyOn(searchSelectors, 'searchInSidebar').mockReturnValue(true);

    const component = render();
    expect(component.root.findByProps({ 'data-testid': 'desktop-search' }).props.searchInSidebar).toBe(true);
  });
});

describe('search button', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const render = () => renderer.create(<TestContainer store={store}><Topbar /></TestContainer>);

  it('button has theme bg color applied', () => {
    const color = searchSelectors.searchButtonColor.resultFunc('bannerColorButton', book, 'blue');
    jest.spyOn(searchSelectors, 'searchButtonColor').mockReturnValue(color);
    jest.spyOn(searchSelectors, 'mobileToolbarOpen').mockReturnValue(true);

    const component = render();
    const [searchButton, searchButtonMobile] = component.root.findAllByType(SearchButton);

    expect(searchButton.props.colorSchema).toEqual('blue');
    expect(searchButtonMobile.props.colorSchema).toEqual('blue');
  });

  it('button has gray bg color applied', () => {
    const color = searchSelectors.searchButtonColor.resultFunc('grayButton', book, 'red');
    jest.spyOn(searchSelectors, 'searchButtonColor').mockReturnValue(color);

    const component = render();
    const [searchButton, searchButtonMobile] = component.root.findAllByType(SearchButton);

    expect(searchButton.props.colorSchema).toEqual('gray');
    expect(searchButtonMobile.props.colorSchema).toEqual('gray');
  });

  it('button has no bg color applied', () => {
    const color = searchSelectors.searchButtonColor.resultFunc(null, book, 'blue');
    jest.spyOn(searchSelectors, 'searchButtonColor').mockReturnValue(color);

    const component = render();
    const [searchButton, searchButtonMobile] = component.root.findAllByType(SearchButton);

    expect(searchButton.props.colorSchema).toEqual(null);
    expect(searchButtonMobile.props.colorSchema).toEqual(null);
  });

  it('new search buttons use new close button', () => {
    jest.spyOn(searchSelectors, 'searchButtonColor').mockReturnValue('green');

    const component = render();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    renderer.act(
      () => findById('desktop-search-input').props.onChange(inputEvent)
    );

    const event = makeEvent();
    renderer.act(() => findById('desktop-search').props.onSubmit(event));

    const [closeButton] = component.root.findAllByType(CloseButtonNew);

    expect(closeButton).toBeTruthy();
  });
});

describe('mobile menu button', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('opens mobile menu', () => {
    const component = renderer.create(<TestContainer store={store}><Topbar /></TestContainer>);

    renderer.act(() => {
      component.root.findByType(MenuButton).props.onClick({preventDefault: jest.fn()});
    });

    expect(dispatch).toHaveBeenCalledWith(openMobileMenu());
  });
});

describe('text resizer', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    store.dispatch(setTextSize(0));
  });

  it('does not render if textSize is null', () => {
    store.dispatch((setTextSize as any)(null));
    const component = renderer.create(<TestContainer store={store}><Topbar /></TestContainer>);
    expect(component.root.findAllByType(TextResizerMenu)).toEqual([]);
    expect(component).toMatchSnapshot();
  });

  it('opens menu when clicking menu button', () => {
    const component = renderer.create(<TestContainer store={store}><Topbar /></TestContainer>);
    expect(component.root.findAllByType(TextResizerMenu)).toEqual([]);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'text-resizer' })
        .findByProps({ isOpen: false }).props.onClick({ preventDefault: jest.fn() });
    });

    expect(component.root.findByType(TextResizerMenu)).toBeDefined();
    expect(component).toMatchSnapshot();
  });

  it('changes the text size with buttons', () => {
    const component = renderer.create(<TestContainer store={store}><Topbar /></TestContainer>);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'text-resizer' })
        .findByProps({ isOpen: false }).props.onClick({ preventDefault: jest.fn() });
    });

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'decrease-text-size' }).props.onClick({ preventDefault: jest.fn()  });
    });

    expect(dispatch).toHaveBeenCalledWith(setTextSize(-1));

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'increase-text-size' }).props.onClick({ preventDefault: jest.fn()  });
    });

    expect(dispatch).toHaveBeenCalledWith(setTextSize(0));

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'increase-text-size' }).props.onClick({ preventDefault: jest.fn()  });
    });

    expect(dispatch).toHaveBeenCalledWith(setTextSize(1));

    dispatch.mockReset();

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'change-text-size' })
        .props.onChange({ currentTarget: { value: '3' } });
    });

    expect(dispatch).toHaveBeenCalledWith(setTextSize(3));
  });

  it('keeps values within bounds', () => {
    store.dispatch(setTextSize(textResizerMaxValue));
    dispatch.mockClear();
    const component = renderer.create(<TestContainer store={store}><Topbar /></TestContainer>);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'text-resizer' })
        .findByProps({ isOpen: false }).props.onClick({ preventDefault: jest.fn() });
    });

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'increase-text-size' }).props.onClick({ preventDefault: jest.fn() });
    });

    expect(dispatch).not.toHaveBeenCalledWith(setTextSize((textResizerMaxValue + 1) as any));

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'decrease-text-size' }).props.onClick({ preventDefault: jest.fn() });
    });

    expect(dispatch).toHaveBeenCalledWith(setTextSize((textResizerMaxValue - 1 as any)));

    renderer.act(() => {
      store.dispatch(setTextSize(textResizerMinValue));
      dispatch.mockClear();
    });

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'decrease-text-size' }).props.onClick({ preventDefault: jest.fn() });
    });

    expect(dispatch).not.toHaveBeenCalledWith(setTextSize((textResizerMinValue - 1 as any)));

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'change-text-size' })
        .props.onChange({ currentTarget: { value: textResizerMaxValue + 1 } });
    });

    expect(dispatch).not.toHaveBeenCalledWith(setTextSize(textResizerMaxValue + 1 as any));

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'change-text-size' })
        .props.onChange({ currentTarget: { value: textResizerMinValue - 1 } });
    });

    expect(dispatch).not.toHaveBeenCalledWith(setTextSize(textResizerMinValue - 1 as any));

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'change-text-size' })
        .props.onChange({ currentTarget: { value: 'invalid' } });
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

});
