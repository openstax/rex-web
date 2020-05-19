import { HighlightsSummary } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook } from '../../actions';
import { formatBookData } from '../../utils';
import { receiveStudyGuides } from '../actions';

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./receiveBook').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./receiveBook').hookBody)(helpers);
  });

  it('fetch study guides on receiveBook', async() => {
    const mockResponse = { asd: 'asd' } as any as HighlightsSummary;

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockResponse)));

    await hook(store.dispatch(receiveBook(formatBookData(book, mockCmsBook))));

    expect(getHighlightsSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receiveStudyGuides(mockResponse));
  });
});
