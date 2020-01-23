import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import mockHighlight from '../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import { resetModules } from '../../../../test/utils';
import { receiveUser } from '../../../auth/actions';
import { formatUser } from '../../../auth/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { receiveHighlights, receiveHighlightsTotalCounts } from '../actions';
import { HighlightData } from '../types';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./locationChange').default)(helpers);
  });

  it('noops with no book', () => {
    store.dispatch(receivePage({...page, references: []}));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no page', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('receives highlights', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights}));
    jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(Promise.resolve({}));

    await hook();

    expect(dispatch).toHaveBeenCalledWith(receiveHighlights(highlights));
  });

  it('noops on invalid response', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));
    jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(Promise.resolve({}));

    await hook();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops if totalCountsInState are not empty', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    const totalCountsInState = { somePage: {[HighlightColorEnum.Green]: 1} };
    store.dispatch(receiveHighlightsTotalCounts(totalCountsInState, new Map()));

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));
    jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(Promise.resolve({ countsPerSource: { pageId: {[HighlightColorEnum.Green]: 1} }}));

    await hook();

    expect(dispatch).not.toHaveBeenCalled();
    expect(store.getState().content.highlights.summary.totalCountsPerPage).toEqual(totalCountsInState);
  });
});
