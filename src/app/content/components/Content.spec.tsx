import React from 'react';
import { Provider } from 'react-redux';
import renderer, { ReactTestInstance } from 'react-test-renderer';
import { createStore } from 'redux';
import { setStateFinished } from '../../../test/reactutils';
import * as Services from '../../context/Services';
import { AppServices, AppState } from '../../types';
import { initialState } from '../reducer';
import { ArchiveBook, ArchivePage } from '../types';
import Content, { ContentComponent } from './Content';

const book = {
  id: 'booklongid',
  shortId: 'book',
  title: 'book title',
  tree: {
    contents: [
      {
        contents: [
          {
            id: 'pagelongid2',
            shortId: 'page2',
            title: 'page title2',
          },
        ],
        id: 'pagelongid',
        shortId: 'page',
        title: 'page title',
      },
    ],
    id: 'booklongid',
    shortId: 'book',
    title: 'book title',
  },
  version: '0',
};
const page = {
  id: 'pagelongid',
  shortId: 'page',
  title: 'page title',
  version: '0',
};

const pageArchive = {
  ...page,
  content: 'some page content yo',
};

describe('content', () => {
  let archiveLoader: {[k in  keyof AppServices['archiveLoader']]: jest.SpyInstance};
  const services = {} as AppServices;

  beforeEach(() => {
    archiveLoader = {
      book: jest.fn(() => Promise.resolve(book as ArchiveBook)),
      cachedBook: jest.fn(() => (book as ArchiveBook)),
      cachedPage: jest.fn(() => (pageArchive as ArchivePage)),
      page: jest.fn(() => Promise.resolve(pageArchive as ArchivePage)),
    };

    (services as any).archiveLoader = archiveLoader;
  });

  it('matches snapshot', (done) => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as AppState;

    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    process.nextTick(() => {
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });

  it('renders empty state', (done) => {
    const state = {
      content: initialState,
    } as AppState;
    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    process.nextTick(() => {
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });

  it('updates after initial render', async() => {
    const state1 = {
      content: initialState,
    } as AppState;
    const state2 = {
      content: {
        ...initialState,
        book, page,
      },
    } as AppState;

    const go = {type: 'go'};

    const reducer = (_: AppState | undefined, action?: typeof go) => action && action.type === 'go'
      ? state2
      : state1;

    const store = createStore(reducer, state1);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    const before = component.toJSON();
    store.dispatch(go);

    const target = component.root.findByType(ContentComponent) as ReactTestInstance;
    await setStateFinished(target);

    const after = component.toJSON();
    expect(before).not.toEqual(after);
  });
});

/*
 * jsdom chokes on cnx-recipes styles and produces large nasty
 * error messages. the styles are valid, jsdom's css parser
 * is incomplete, so hide these messages
 */
const originalConsoleError = console.error;  // tslint:disable-line:no-console
console.error = (msg) => {  // tslint:disable-line:no-console
  if (msg.indexOf('Error: Could not parse CSS stylesheet') === 0) { return; }
  originalConsoleError(msg);
};
