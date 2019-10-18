import { SerializedHighlight } from '@openstax/highlighter';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { updateHighlight } from '../actions';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};
const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

const updateMockHighlight = () => ({
    id: Math.random().toString(36).substring(7),
  }) as unknown as SerializedHighlight['data'];

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./updateHighlight').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./updateHighlight').hookBody)(helpers);
  });

  it('noops with no book', async() => {
    store.dispatch(receivePage(page));
    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight');

    await hook(updateHighlight(updateMockHighlight()));

    expect(updateHighlightClient).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no page', async() => {
    store.dispatch(receiveBook(book));
    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight');

    await hook(updateHighlight(updateMockHighlight()));

    expect(updateHighlightClient).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('updates highlight', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight');
    const mock = updateMockHighlight();

    await hook(updateHighlight(mock));

    expect(updateHighlightClient).toHaveBeenCalledWith(
      expect.objectContaining({id: book.id}),
      expect.objectContaining({id: page.id}),
      mock
    );
  });
});
