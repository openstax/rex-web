import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { deleteHighlight } from '../actions';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};
const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./removeHighlight').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./removeHighlight').hookBody)(helpers);
  });

  it('noops with no book', async() => {
    store.dispatch(receivePage(page));
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight');

    await hook(deleteHighlight('1'));

    expect(deleteHighlightClient).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no page', async() => {
    store.dispatch(receiveBook(book));
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight');

    await hook(deleteHighlight('1'));

    expect(deleteHighlightClient).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('deletes highlight', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight');

    await hook(deleteHighlight('1'));

    expect(deleteHighlightClient).toHaveBeenCalledWith(
      expect.objectContaining({id: book.id}),
      expect.objectContaining({id: page.id}),
      '1'
    );
  });
});
