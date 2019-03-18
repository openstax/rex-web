import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { book as archiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { push } from '../../navigation/actions';
import { AppState } from '../../types';
import { initialState } from '../reducer';
import { content } from '../routes';
import { formatBookData } from '../utils';
import ConnectedContentLink from './ContentLink';

const BOOK_SLUG = 'book-slug-1';
const PAGE_SLUG = 'test-page-1';

const book = formatBookData(archiveBook, mockCmsBook);

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
