import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { push } from '../../navigation/actions';
import { AppState } from '../../types';
import { initialState } from '../reducer';
import { content } from '../routes';
import ConnectedContentLink from './ContentLink';

const BOOK_SLUG = 'bookslug';
const PAGE_SLUG = 'page-title';

const book = {
  id: 'booklongid',
  shortId: 'book',
  slug: BOOK_SLUG,
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

  it('dispatches navigation action on click', () => {
    const pathname = '/doesnotmatter';
    const state = {
      content: {
        ...initialState,
        book, page,
      },
      navigation: { pathname },
    } as any as AppState;
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
      params: {book: BOOK_SLUG, page: PAGE_SLUG},
      route: content,
      state: {
        bookUid: 'booklongid',
        bookVersion: '0',
        pageUid: 'pagelongid',
      },
    }));
    expect(event.preventDefault).toHaveBeenCalled();
  });

});
