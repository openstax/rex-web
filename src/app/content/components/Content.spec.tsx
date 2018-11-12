import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { AppState } from '../../types';
import { initialState } from '../reducer';
import * as utils from '../utils';
import Content from './Content';

const book = {
  id: 'booklongid',
  shortId: 'book',
  title: 'book title',
};
const page = {
  id: 'pagelongid',
  shortId: 'page',
  title: 'page title',
};

const pageArchive = {
  ...page,
  content: 'some page content yo',
};

describe('content', () => {
  let archiveLoader: jest.SpyInstance;

  beforeEach(() => {
    archiveLoader = jest.spyOn(utils, 'archiveLoader');
    archiveLoader.mockImplementation((id: string) => {
      switch (id) {
        case 'book':
          return Promise.resolve(book);
        case 'book:page':
          return Promise.resolve(pageArchive);
        default:
          throw new Error('unknown id');
      }
    });
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
      <Content />
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
      <Content />
    </Provider>);

    process.nextTick(() => {
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });

  it('updates after initial render', (done) => {
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
      <Content />
    </Provider>);

    process.nextTick(() => {
      const before = component.toJSON();
      store.dispatch(go);
      process.nextTick(() => {
        const after = component.toJSON();
        expect(before).not.toEqual(after);
        done();
      });
    });
  });

});
