import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { FirstArgumentType, MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { createHighlight } from '../actions';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};
const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

const createMockHighlight = () => ({
    id: Math.random().toString(36).substring(7),
  }) as FirstArgumentType<typeof createHighlight>;

describe('locationChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./createHighlight').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

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
});
