import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { push } from '../../navigation/actions';
import { AppState } from '../../types';
import { initialState } from '../reducer';
import { content } from '../routes';
import ConnectedContentLink from './ContentLink';

const book = {
  id: 'booklongid',
  shortId: 'book',
  title: 'book title',
  tree: {
    contents: [
      {
        id: 'pagelongid@0',
        shortId: 'page@0',
        title: 'page title',
      },
    ],
    id: 'booklongid@0',
    shortId: 'book@0',
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

describe('ContentLink', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('dispatches navigation action on click (provided with non-tree book/page data)', () => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as AppState;
    const store = createStore((s: AppState | undefined) => s || state, state);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink book={book} page={page} />
    </Provider>);

    const event = {
      preventDefault: jest.fn(),
    };

    component.root.findByType('a').props.onClick(event);

    expect(dispatchSpy).toHaveBeenCalledWith(push({
      params: {bookId: 'book', pageId: 'page'},
      route: content,
      state: {
        bookUid: 'booklongid',
        bookVersion: '0',
        pageUid: 'pagelongid',
      },
    }));
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('dispatches navigation action on click (provided with tree book/page data)', () => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as AppState;
    const store = createStore((s: AppState | undefined) => s || state, state);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink book={book.tree} page={book.tree.contents[0]} />
    </Provider>);

    const event = {
      preventDefault: jest.fn(),
    };

    component.root.findByType('a').props.onClick(event);

    expect(dispatchSpy).toHaveBeenCalledWith(push({
      params: {bookId: 'book', pageId: 'page'},
      route: content,
      state: {
        bookUid: 'booklongid',
        bookVersion: '0',
        pageUid: 'pagelongid',
      },
    }));
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('dispatches navigation action on click (with minimal data provided)', () => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as AppState;
    const store = createStore((s: AppState | undefined) => s || state, state);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    consoleError.mockImplementation(() => null);

    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink
        book={{id: book.id, shortId: book.shortId}}
        page={{id: page.id, title: page.title, shortId: page.shortId}} />
    </Provider>);

    const event = {
      preventDefault: jest.fn(),
    };

    component.root.findByType('a').props.onClick(event);

    expect(consoleError).toHaveBeenCalledWith('BUG: ContentLink was not provided with book version for target content');
    expect(dispatchSpy).toHaveBeenCalledWith(push({
      params: {bookId: 'book', pageId: 'page'},
      route: content,
    }));
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
