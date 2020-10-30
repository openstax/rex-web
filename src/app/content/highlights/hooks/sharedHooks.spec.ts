import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { MiddlewareAPI, Store } from '../../../types';
import { initialState as initialContentState } from '../../reducer';
import { formatBookData } from '../../utils';

const book = formatBookData(archiveBook, mockCmsBook);

describe('openModal', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookFactory: typeof import ('./sharedHooks').openModal;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore({
      content: {
        ...initialContentState,
        book,
        page,
        params: {
          book: {slug: 'book'},
          page: {slug: 'page'},
        },
      },
    });

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hookFactory = (require('./sharedHooks').openModal);
  });

  it('sets correct location', () => {
    const hook = hookFactory('myModalName')(helpers);

    hook();

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        search: 'modal=myModalName',
        state: expect.objectContaining({bookUid: book.id, pageUid: page.id}),
      }),
    }));
  });
});
