import queryString from 'query-string';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { initialState as initialContentState } from '../../reducer';
import { formatBookData } from '../../utils';
import { closeStudyGuides } from '../actions';

const book = formatBookData(archiveBook, mockCmsBook);

describe('closeStudyGuidesHook', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./closeStudyGuides').hookBody>;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore({
      content: {
        ...initialContentState,
        params: {
          book: { slug: 'book' },
          page: { slug: 'page' },
        },
      },
      navigation: {
        ...({} as any),
        query: queryString.parse('somequery=value&modal=SG'),
      },
    });

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./closeStudyGuides').hookBody)(helpers);
  });

  it('removes modal parameter from query', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));

    hook(closeStudyGuides());
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        search: expect.not.stringMatching('modal=SG'),
        state: expect.objectContaining({bookUid: book.id, pageUid: page.id}),
      }),
    }));
  });
});
