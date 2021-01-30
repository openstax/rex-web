import { Highlight } from '@openstax/highlighter/dist/api';
import { ApplicationError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { FirstArgumentType, MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';

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
    expect.assertions(2);
    const error = {} as any;
    const meta = {locationFilterId: 'id', pageId: 'id'};

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const createHighlightClient = jest.spyOn(helpers.highlightClient, 'addHighlight')
      .mockRejectedValue(error);
    const mock = createMockHighlight();

    try {
    await hook(createHighlight(mock, meta));
    } catch (error) {
      expect(createHighlightClient).toHaveBeenCalledWith({highlight: mock});
      expect(dispatch).toHaveBeenCalledWith(
        receiveDeleteHighlight(mock as unknown as Highlight, {...meta, revertingAfterFailure: true})
      );
    }
  });

  it('throws HighlightCreateError', async() => {
    expect.assertions(3);
    const error = {} as any;
    const meta = { locationFilterId: 'id', pageId: 'id' };

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const createHighlightClient = jest.spyOn(helpers.highlightClient, 'addHighlight')
      .mockRejectedValue(error);
    const mock = createMockHighlight();

    try {
      await hook(createHighlight(mock, meta));
    } catch (error) {
      expect(createHighlightClient).toHaveBeenCalledWith({ highlight: mock });
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.create);
      expect(error.meta).toEqual({ destination: 'page' });
    }
  });

  it('throws ApplicationError', async() => {
    expect.assertions(3);
    const mockCustomApplicationError = new ApplicationError('error');
    const meta = { locationFilterId: 'id', pageId: 'id' };

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const createHighlightClient = jest.spyOn(helpers.highlightClient, 'addHighlight')
      .mockRejectedValue(mockCustomApplicationError);
    const mock = createMockHighlight();

    try {
      await hook(createHighlight(mock, meta));
    } catch (error) {
      expect(createHighlightClient).toHaveBeenCalledWith({ highlight: mock });
      expect(error instanceof ApplicationError).toEqual(true);
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });
});
