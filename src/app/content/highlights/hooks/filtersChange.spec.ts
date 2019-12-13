import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { ArchiveTree } from '../../types';
import { formatBookData } from '../../utils';
import { filtersChange, receiveSummaryHighlights, setChaptersFilter, setColorsFilter, setIsLoadingSummary } from '../actions';
import { HighlightData, SummaryHighlights } from '../types';
import { stripIdVersion } from '../../utils/idUtils';

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
    expect(filters.chapters.length).toEqual(0);
    expect(filters.colors.length).toEqual(5);

    const chapters = [book.tree.contents[0].id, book.tree.contents[1].id];
    store.dispatch(setChaptersFilter(chapters));

    const highlights = [{
      id: 'highlight1',
      sourceId: book.tree.contents[0].id,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights as HighlightData[]}));

    await hook(filtersChange());

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
