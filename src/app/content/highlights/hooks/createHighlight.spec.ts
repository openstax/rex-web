import Sentry from '../../../../helpers/Sentry';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { toastNotifications } from '../../../notifications/selectors';
import { FirstArgumentType, MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';
import { HighlightData } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};
const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.mock('../../../../helpers/Sentry');
jest.doMock('../../../../config', () => mockConfig);

const createMockHighlight = () => ({
    id: Math.random().toString(36).substring(7),
  }) as FirstArgumentType<typeof createHighlight>;

describe('createHighlight', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./createHighlight').hookBody>;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./createHighlight').hookBody)(helpers);
  });

  it('creates highlight', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    const createHighlightClient = jest.spyOn(helpers.highlightClient, 'addHighlight');
    const mock = createMockHighlight();

    await hook(createHighlight(mock, {locationFilterId: 'id', pageId: 'id'}));

    expect(createHighlightClient).toHaveBeenCalledWith({highlight: mock});
  });

  it('doesn\'t call highlightClient when reverting deletion', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    const createHighlightClient = jest.spyOn(helpers.highlightClient, 'addHighlight');
    const mock = createMockHighlight();

    await hook(createHighlight(mock, {locationFilterId: 'id', pageId: 'id', revertingAfterFailure: true}));

    expect(createHighlightClient).not.toHaveBeenCalled();
  });

  it('deletes a highlight that failed to create', async() => {
    const error = {} as any;
    const meta = {locationFilterId: 'id', pageId: 'id'};

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const createHighlightClient = jest.spyOn(helpers.highlightClient, 'addHighlight')
      .mockRejectedValue(error);
    const mock = createMockHighlight();

    await hook(createHighlight(mock, meta));

    expect(createHighlightClient).toHaveBeenCalledWith({highlight: mock});
    expect(Sentry.captureException).toHaveBeenCalledWith(error);

    expect(dispatch).toHaveBeenCalledWith(
      receiveDeleteHighlight(mock as unknown as HighlightData, {...meta, revertingAfterFailure: true})
    );

    const hasAdequateErrorToast = toastNotifications(store.getState())
      .some((notification) => notification.messageKey === 'i18n:notification:toast:highlights:create-failure');

    expect(hasAdequateErrorToast).toBe(true);
  });
});
