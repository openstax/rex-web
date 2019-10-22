import { Location } from 'history';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import * as routes from '../../routes';
import { formatBookData } from '../../utils';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;
  let payload: Parameters<typeof hook>[0];

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    payload = {
      action: 'PUSH',
      location: {} as Location,
      match: {
        params: {
          book: 'book-slug-1',
          page: 'test-page-1',
        },
        route: routes.content,
      },
    };

    hook = (require('./locationChange').default)(helpers);
  });

  it('noops with no book', () => {
    store.dispatch(receivePage({...page, references: []}));
    const getHighlightsByPage = jest.spyOn(helpers.highlightClient, 'getHighlightsByPage');

    hook(payload);

    expect(getHighlightsByPage).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no page', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    const getHighlightsByPage = jest.spyOn(helpers.highlightClient, 'getHighlightsByPage');

    hook(payload);

    expect(getHighlightsByPage).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
