import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import addCurrentPageToSummaryFilters from './addCurrentPageToSummaryFilters';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

describe('addCurrentPageToSummaryFilters', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

  });

  it('update summary filters with current page', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const {content: {highlights: {summary}}} = store.getState();

    expect(summary.filters.chapters.length).toEqual(0);

    addCurrentPageToSummaryFilters(helpers);

    expect(summary.filters.chapters.length).toEqual(1);
  });
});
