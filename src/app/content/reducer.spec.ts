import omit from 'lodash/fp/omit';
import { book as archiveBook, page as archivePage } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { locationChange } from '../navigation/actions';
import { AnyAction, FirstArgumentType } from '../types';
import { assertWindow } from '../utils';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import { content } from './routes';
import searchReducer from './search/reducer';
import { formatBookData } from './utils';

jest.mock('./search/reducer', () => jest.fn((state: any) => state));
jest.mock('./highlights/reducer', () => jest.fn((state: any) => state));

const book = formatBookData(archiveBook, mockCmsBook);

describe('content reducer', () => {

  it('reduces openToc', () => {
    const state = {
      ...initialState,
      tocOpen: false,
    };
    const newState = reducer(state, actions.openToc());
    expect(newState.tocOpen).toEqual(true);
  });

  it('reduces closeToc', () => {
    const state = {
      ...initialState,
      tocOpen: true,
    };
    const newState = reducer(state, actions.closeToc());
    expect(newState.tocOpen).toEqual(false);
  });

  it('reduces resetToc', () => {
    const state = {
      ...initialState,
      tocOpen: true,
    };
    const newState = reducer(state, actions.resetToc());
    expect(newState.tocOpen).toEqual(null);
  });

  it('reduces requestBook', () => {
    const newState = reducer(initialState, actions.requestBook({uuid: 'bookId', version: '3'}));

    expect(newState.loading.book!).toEqual({uuid: 'bookId', version: '3'});
  });

  it('reduces requestPage', () => {
    const newState = reducer(initialState, actions.requestPage({slug: 'pageId'}));

    expect(newState.loading.page).toEqual({slug: 'pageId'});
  });

  it('reduces receiveBook', () => {
    const state = {
      ...initialState,
      loading: {book: {slug:  book.slug}},
    };
    const newState = reducer(state, actions.receiveBook(book));
    expect(newState.loading.book).not.toBeDefined();
    if (newState.book) {
      expect(newState.book.id).toEqual(book.id);
      expect((newState.book as any).content).not.toBeDefined();
    } else {
      expect(newState.book).toBeTruthy();
    }
  });

  it('reduces receivePage', () => {
    const page = { id: 'pageId', content: 'fooobarcontent' } as FirstArgumentType<typeof actions.receivePage>;
    const state = {
      ...initialState,
      loading: {page: {slug: 'pageId'}},
    };
    const newState = reducer(state, actions.receivePage(page));
    expect(newState.loading.page).not.toBeDefined();
    if (newState.page) {
      expect(newState.page.id).toEqual('pageId');
      expect((newState.page as any).content).not.toBeDefined();
    } else {
      expect(newState.page).toBeTruthy();
    }
  });

  it('resets state when location changes to a new book', () => {
    const state = {
      ...initialState,
      params: {
        book: {
          slug: 'foo',
        },
        page: {
          slug: 'bar',
        },
      },
      tocOpen: true,
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: {
            slug: 'newbook',
          },
          page: {
            slug: 'bar',
          },
        },
        route: content,
      },
    }));

    expect(newState).toEqual({
      ...initialState,
      params: {
        book: {
          slug: 'newbook',
        },
        page: {
          slug: 'bar',
        },
      },
    });

  });

  it('resets page when location changes to new page', () => {
    const state = {
      ...initialState,
      book,
      page: {...archivePage, references: []},
      params: {
        book: {
          slug: 'foo',
        },
        page: {
          slug: 'bar',
        },
      },
      tocOpen: true,
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: {
            slug: 'foo',
          },
          page: {
            slug: 'new page',
          },
        },
        route: content,
      },
    }));

    expect(newState).toEqual({
      ...omit('page', state),
      params: {
        book: {
          slug: 'foo',
        },
        page: {
          slug: 'new page',
        },
      },
    });
  });

  it('adds params on location change', () => {
    const state = {
      ...initialState,
      params: {
        book: {
          slug: book.slug,
        },
        page: {
          slug: 'foo',
        },
      },
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: 'new page',
          },
        },
        route: content,
      },
    }));

    expect(newState).toEqual({
      ...initialState,
      params: {
        book: {
          slug: book.slug,
        },
        page: {
          slug: 'new page',
        },
      },
    });
  });

  it('composes searchReducer', () => {
    const action = {type: 'foo'} as unknown as AnyAction;
    const state = initialState;
    reducer(state, action);

    expect(searchReducer).toHaveBeenCalledWith(state.search, action);
  });
});
