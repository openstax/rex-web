import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { stripIdVersion } from '../../utils/idUtils';
import { receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { HighlightData, SummaryHighlights } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

describe('filtersChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let hook: ReturnType<typeof import ('./filtersChange').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./filtersChange').hookBody)(helpers);
  });

  it('receive summary data', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const {content: {highlights: {summary: {filters}}}} = store.getState();
    expect(filters.locationIds.length).toEqual(0);
    expect(filters.colors.length).toEqual(5);

    const locationIds = [book.tree.contents[0].id, book.tree.contents[1].id];
    store.dispatch(setSummaryFilters({
      ...filters,
      locationIds,
    }));

    const highlights = [{
      id: 'highlight1',
      sourceId: book.tree.contents[0].id,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights as HighlightData[]}));

    const response: SummaryHighlights = {
      [stripIdVersion(book.tree.id)]: {
        [stripIdVersion(book.tree.contents[0].id)]: [{
          id: 'highlight1',
          sourceId: book.tree.contents[0].id,
        } as HighlightData],
      },
    };

    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response));
  });
});
