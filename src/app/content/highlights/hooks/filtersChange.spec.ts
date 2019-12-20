import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage, pageInChapter } from '../../../../test/mocks/archiveLoader';
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

  it('receive summary data for selected page', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const {content: {highlights: {summary: {filters}}}} = store.getState();
    expect(filters.locationIds.length).toEqual(0);
    expect(filters.colors.length).toEqual(5);

    const highlights = [{
      id: 'highlight1',
      sourceId: book.tree.contents[0].id,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights as HighlightData[]}));

    const locationIds = [book.tree.contents[0].id, book.tree.contents[1].id];
    await hook(store.dispatch(setSummaryFilters({
      ...filters,
      locationIds,
    })));

    const response: SummaryHighlights = {
      [stripIdVersion(book.tree.contents[0].id)]: {
        [stripIdVersion(book.tree.contents[0].id)]: [{
          id: 'highlight1',
          sourceId: book.tree.contents[0].id,
        } as HighlightData],
      },
    };

    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response));
  });

  it('noops without book', async() => {
    await hook(store.dispatch(setSummaryFilters({
      colors: [],
      locationIds: [],
    })));

    expect(dispatch).not.toBeCalled();
  });

  it('receive summary data for selected page in chapter', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...pageInChapter, references: []}));
    const chapterIdForPageInChapter = 'testbook1-testchapter5-uuid';

    const {content: {highlights: {summary: {filters}}}} = store.getState();
    expect(filters.locationIds.length).toEqual(0);
    expect(filters.colors.length).toEqual(5);

    const highlights = [{
      id: 'highlight1',
      sourceId: pageInChapter.id,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights as HighlightData[]}));

    const locationIds = [chapterIdForPageInChapter];
    await hook(store.dispatch(setSummaryFilters({
      ...filters,
      locationIds,
    })));

    const response: SummaryHighlights = {
      [chapterIdForPageInChapter]: {
        [pageInChapter.id]: [{
          id: 'highlight1',
          sourceId: pageInChapter.id,
        } as HighlightData],
      },
    };

    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response));
  });

  it('noops without book', async() => {
    await hook(store.dispatch(setSummaryFilters({
      colors: [],
      locationIds: [],
    })));

    expect(dispatch).not.toBeCalled();
  });

  it('return before api call when there are no filters', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    await hook(store.dispatch(setSummaryFilters({
      colors: [],
      locationIds: [],
    })));

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));

    expect(helpers.highlightClient.getHighlights).not.toBeCalled();
    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}));
  });

  it('handle case for no highlights.data', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    await hook(store.dispatch(setSummaryFilters({
      colors: [HighlightColorEnum.Blue],
      locationIds: ['chapter'],
    })));

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));

    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}));
  });

  it('omit highlights for which location was not found', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    const pageId = stripIdVersion(book.tree.contents[0].id);

    const highlights = [{
      id: 'hl1',
      sourceId: pageId,
    }, {
      id: 'hl2',
      sourceId: 'id-not-from-book',
    }] as HighlightData[];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights}));

    await hook(store.dispatch(setSummaryFilters({
      colors: [HighlightColorEnum.Blue],
      locationIds: [pageId, 'id-not-from-book'],
    })));

    const response: SummaryHighlights = {
      [pageId]: {
        [pageId]: [highlights[0]],
      },
    };

    expect(dispatch).toBeCalledWith(receiveSummaryHighlights(response));
  });
});
