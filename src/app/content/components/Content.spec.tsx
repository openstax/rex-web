import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import mockArchiveLoader, { book, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import MobileScrollLock from '../../components/MobileScrollLock';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { AppServices, AppState, Store } from '../../types';
import { openToc } from '../actions';
import { Book } from '../types';
import { formatBookData } from '../utils';
import Content from './Content';
import Page from './Page';
import { Sidebar } from './Sidebar';
import { CloseSidebarControl, OpenSidebarControl, SidebarControl } from './SidebarControl';

describe('content', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  let store: Store;
  const services = {} as AppServices;
  const bookState: Book = formatBookData(book, mockCmsBook);

  beforeEach(() => {
    store = createTestStore({navigation: new URL('https://localhost/books/book-slug-1/pages/doesnotmatter')});
    state = store.getState();

    archiveLoader = mockArchiveLoader();
    (services as any).archiveLoader = archiveLoader;
  });

  it('matches snapshot', () => {
    state.content.book = bookState;
    state.content.page = shortPage;

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

  it('renders with ToC in null state', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const sidebarComponent = component.root.findByType(Sidebar);

    expect(sidebarComponent.props.isOpen).toBe(null);
  });

  it('clicking overlay closes toc', () => {
    store.dispatch(openToc());

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const sidebarComponent = component.root.findByType(Sidebar);
    const mobileScrollLock = component.root.findByType(MobileScrollLock);

    expect(sidebarComponent.props.isOpen).toBe(true);
    mobileScrollLock.props.onClick();
    expect(sidebarComponent.props.isOpen).toBe(false);
  });

  it('SidebarControl opens and closes ToC', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.root.findByType(Sidebar).props.isOpen).toBe(null);
    component.root.findAllByType(CloseSidebarControl)[0].findByType(SidebarControl).props.onClick();
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(false);
    component.root.findAllByType(OpenSidebarControl)[0].findByType(SidebarControl).props.onClick();
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
  });
});
