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
import { receiveHighlightsTotalCounts, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { HighlightData, SummaryHighlights } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

describe('filtersChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let hook: ReturnType<typeof import ('./loadMore').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./loadMore').hookBody)(helpers);
  });

  it('receive summary data for selected page', async() => {
    const pageId = 'testbook1-testpage9-uuid';

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: 1,
    }));

    const {content: {highlights: {summary: {filters}}}} = store.getState();
    expect(filters.locationIds.length).toEqual(0);
    expect(filters.colors.length).toEqual(5);

    const highlights = [{
      id: 'highlight1',
      sourceId: pageId,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: highlights as HighlightData[],
        meta: {
          perPage: 1,
          totalCount: 1,
        },
      }))
    ;

    const locationIds = [pageId];
    await hook(store.dispatch(setSummaryFilters({locationIds})));

    const response: SummaryHighlights = {
      [stripIdVersion(pageId)]: {
        [stripIdVersion(pageId)]: [{
          id: 'highlight1',
          sourceId: pageId,
        } as HighlightData],
      },
    };

    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response, null));
  });

  it('receive summary data for selected page in chapter', async() => {
    const chapterIdForPageInChapter = 'testbook1-testchapter5-uuid';

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...pageInChapter, references: []}));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageInChapter.id]: 1,
    }));

    const {content: {highlights: {summary: {filters}}}} = store.getState();
    expect(filters.locationIds.length).toEqual(0);
    expect(filters.colors.length).toEqual(5);

    const highlights = [{
      id: 'highlight1',
      sourceId: pageInChapter.id,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: highlights as HighlightData[],
        meta: {
          perPage: 1,
          totalCount: 1,
        },
      }))
    ;

    const locationIds = [chapterIdForPageInChapter];
    await hook(store.dispatch(setSummaryFilters({locationIds})));

    const response: SummaryHighlights = {
      [chapterIdForPageInChapter]: {
        [pageInChapter.id]: [{
          id: 'highlight1',
          sourceId: pageInChapter.id,
        } as HighlightData],
      },
    };

    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response, null));
  });

  it('noops without book', async() => {
    await hook(store.dispatch(setSummaryFilters({
      colors: [],
      locationIds: [],
    })));

    expect(helpers.highlightClient.getHighlights).not.toBeCalled();
    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}, null));
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
    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}, null));
  });

  it('handle case for no highlights.data', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    await hook(store.dispatch(setSummaryFilters({
      colors: [HighlightColorEnum.Blue],
      locationIds: ['testbook1-testchapter1-uuid'],
    })));

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));

    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}, null));
  });
});
