import { createMemoryHistory } from 'history';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { combineReducers, createStore } from 'redux';
import mockArchiveLoader, { book, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import createReducer from '../../navigation/reducer';
import { AppServices, AppState } from '../../types';
import contentReducer, { initialState } from '../reducer';
import { Book } from '../types';
import { formatBookData } from '../utils';
import Content from './Content';
import Page from './Page';
import { Sidebar } from './Sidebar';
import { SidebarControl } from './SidebarControl';

describe('content', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  const services = {} as AppServices;
  const bookState: Book = formatBookData(book, mockCmsBook);

  beforeEach(() => {
    state = cloneDeep({
      content: initialState,
      navigation: { pathname: '/books/book-slug-1/pages/doesnotmatter' },
      notifications: [],
    }) as any as AppState;

    archiveLoader = mockArchiveLoader();
    (services as any).archiveLoader = archiveLoader;
  });

  it('matches snapshot', () => {
    state.content.book = bookState;
    state.content.page = shortPage;

    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders empty state', () => {
    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('gets page content out of cached archive query', () => {
    state.content.book = bookState;
    state.content.page = shortPage;

    const store = createStore((s: AppState | undefined) => s || state, state);

    renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(archiveLoader.mock.cachedPage).toHaveBeenCalledTimes(1);
    expect(archiveLoader.mock.cachedPage).toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage4-uuid');
  });

  it('page element is still rendered if archive content is unavailable', () => {
    state.content.book = bookState;
    state.content.page = shortPage;

    const store = createStore((s: AppState | undefined) => s || state, state);
    archiveLoader.mock.cachedPage.mockReturnValue(undefined);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const pageComponent = component.root.findByType(Page);

    expect(pageComponent).toBeDefined();
  });

  it('renders with ToC open', () => {
    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const sidebarComponent = component.root.findByType(Sidebar);

    expect(sidebarComponent.props.isOpen).toBe(true);
  });

  it('SidebarControl opens and closes ToC', () => {
    const history = createMemoryHistory();
    const navigation = createReducer(history.location);
    const store = createStore(combineReducers({content: contentReducer, navigation, notifications: () => []}), state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
    component.root.findByType(SidebarControl).props.onClick();
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(false);
    component.root.findByType(SidebarControl).props.onClick();
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
  });
});
