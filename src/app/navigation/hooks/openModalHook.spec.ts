import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book as archiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { initialState as initialContentState } from '../../content/reducer';
import { formatBookData } from '../../content/utils';
import { MiddlewareAPI, Store } from '../../types';

const book = formatBookData(archiveBook, mockCmsBook);

describe('openModal', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookFactory: typeof import ('./openModalHook').openModal;
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

    hookFactory = (require('./openModalHook').openModal);
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
