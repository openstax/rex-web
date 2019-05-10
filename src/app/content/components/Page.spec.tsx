import { Document } from '@openstax/types/lib.dom';
import cloneDeep from 'lodash/fp/cloneDeep';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { combineReducers, createStore } from 'redux';
import scrollTo from 'scroll-to-element';
import * as mathjax from '../../../helpers/mathjax';
import PromiseCollector from '../../../helpers/PromiseCollector';
import mockArchiveLoader, {
  book,
  page
} from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import SkipToContentWrapper from '../../components/SkipToContentWrapper';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { push } from '../../navigation/actions';
import { AppServices, AppState, MiddlewareAPI, Store } from '../../types';
import * as actions from '../actions';
import reducer, { initialState } from '../reducer';
import * as routes from '../routes';
import { formatBookData } from '../utils';
import ConnectedPage from './Page';

// jest.mock('../../../helpers/mathjax');
jest.mock('scroll-to-element');

describe('Page', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  let store: Store;
  let dispatch: jest.SpyInstance;
  const services = {} as AppServices & MiddlewareAPI;

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();

    state = (cloneDeep({
      content: {
        ...initialState,
        book,
        page,
      },
      navigation: {},
    }) as any) as AppState;

    store = createStore(combineReducers({
      content: reducer,
      navigation: (_: AppState['navigation'] | undefined) => state.navigation,
    }), state);

    dispatch = jest.spyOn(store, 'dispatch');
    services.promiseCollector = new PromiseCollector();
    services.archiveLoader = archiveLoader = mockArchiveLoader();
  });

  const renderDomWithReferences = () => {
    archiveLoader.mockPage(book, {
      ...page,
      content: `
        some text
        <a href="/content/link">some link</a>
        some more text
        <a href="/rando/link">another link</a>
        text
        <button>asdf</button>
        text
        <a href="">link with empty href</a>
      `,
    });

    state.content.references = [
      {
        match: '/content/link',
        params: {
          book: 'book',
          page: 'page-title',
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      },
    ];
    return renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <Services.Provider value={services}>
            <SkipToContentWrapper>
              <ConnectedPage />
            </SkipToContentWrapper>
          </Services.Provider>
        </MessageProvider>
      </Provider>
    );
  };

  it('updates content self closing tags', () => {
    archiveLoader.mock.cachedPage.mockImplementation(() => ({
      ...page,
      content: `<strong data-somethin="asdf"/>asdf<iframe src="someplace"/>`,
    }));
    const {root} = renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <Services.Provider value={services}>
            <SkipToContentWrapper>
              <ConnectedPage />
            </SkipToContentWrapper>
          </Services.Provider>
        </MessageProvider>
      </Provider>
    );
    const pageElement = root.querySelector('#main-content > div');

    if (!pageElement) {
      return expect(pageElement).toBeTruthy();
    }

    expect(pageElement.innerHTML).toEqual(
      '<strong data-somethin="asdf"></strong>asdf<iframe src="someplace"></iframe>'
    );
  });

  it('updates content link with new hrefs', () => {
    const {root} = renderDomWithReferences();
    const [firstLink, secondLink] = Array.from(root.querySelectorAll('#main-content a'));

    if (!firstLink || !secondLink) {
      expect(firstLink).toBeTruthy();
      expect(secondLink).toBeTruthy();
    }

    expect(firstLink.getAttribute('href')).toEqual('/books/book/pages/page-title');
    expect(secondLink.getAttribute('href')).toEqual('/rando/link');
  });

  it('interceptes clicking content links', () => {
    const {root} = renderDomWithReferences();
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

    const makeEvent = (doc: Document) => {
      const event = doc.createEvent('MouseEvents');
      event.initEvent('click', true, false);
      event.preventDefault();
      event.preventDefault = jest.fn();
      return event;
    };

    const evt1 = makeEvent(document);
    const evt2 = makeEvent(document);
    const evt3 = makeEvent(document);
    const evt4 = makeEvent(document);

    firstLink.dispatchEvent(evt1);
    secondLink.dispatchEvent(evt2);
    thirdLink.dispatchEvent(evt3);
    button.dispatchEvent(evt4);

    expect(evt1.preventDefault).toHaveBeenCalled();
    expect(evt2.preventDefault).not.toHaveBeenCalled();
    expect(evt3.preventDefault).not.toHaveBeenCalled();
    expect(evt4.preventDefault).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(push({
      params: {
        book: 'book',
        page: 'page-title',
      },
      route: routes.content,
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }, {
      hash: '',
      search: '',
    }));
  });

  it('removes listener when it unmounts', () => {
    const { root } = renderDomWithReferences();
    const links = Array.from(root.querySelectorAll('#main-content a'));

    for (const link of links) {
      link.removeEventListener = jest.fn();
    }

    ReactDOM.unmountComponentAtNode(root);

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.removeEventListener).toHaveBeenCalled();
    }
  });

  it('doesn\'t break when trying to remove listeners from elements that have no stored handler', () => {
    const { root } = renderDomWithReferences();
    const pageElement = root.querySelector('#main-content > div');

    if (pageElement && document) {
      pageElement.append(document.createElement('a'));
      expect(() => ReactDOM.unmountComponentAtNode(root)).not.toThrow();
    } else {
      expect(pageElement).toBeTruthy();
      expect(document).toBeTruthy();
    }
  });

  it('mounts and unmounts without a dom', () => {
    const element = renderer.create(
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

    expect(element.unmount).not.toThrow();
  });

  it('renders math', () => {
    const typesetMath = jest.spyOn(mathjax, 'typesetMath');
    renderDomWithReferences();
    expect(typesetMath).toHaveBeenCalled();
    typesetMath.mockRestore();
  });

  it('scrolls to top on new content', () => {
    if (!window) {
      return expect(window).toBeTruthy();
    }

    const spy = jest.spyOn(window, 'scrollTo');

    renderToDom(
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

    store.dispatch(actions.receivePage({
      content: 'some other content',
      id: 'adsfasdf',
      references: [],
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    }));

    expect(spy).toHaveBeenCalledWith(0, 0);
  });

  it('scrolls to selected content on load', () => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      content: '<div style="height: 1000px;"></div><div id="somehash"></div>',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    };

    state.navigation.hash = '#somehash';
    state.content.page = someHashPage;

    archiveLoader.mockPage(book, someHashPage);

    const {root} = renderToDom(
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

    const target = root.querySelector('[id="somehash"]');

    expect(target).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('scrolls to selected content on update', () => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      content: '<div style="height: 1000px;"></div><div id="somehash"></div>',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    };

    state.navigation.hash = '#somehash';
    archiveLoader.mockPage(book, someHashPage);

    const {root} = renderToDom(
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

    expect(scrollTo).not.toHaveBeenCalled();

    store.dispatch(actions.receivePage({
      ...someHashPage,
      references: [],
    }));

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
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    store.dispatch(actions.receiveBook(formatBookData(book, mockCmsBook)));

    expect(spy).not.toHaveBeenCalled();
  });

});
