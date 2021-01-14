import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { assertDefined, CustomApplicationError } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import {
  loadMoreSummaryHighlights,
  receiveHighlightsTotalCounts,
  receiveSummaryHighlights,
  setSummaryFilters,
  toggleSummaryHighlightsLoading
} from '../actions';
import { summaryColorFilters, summaryFilters, summaryLocationFilters } from '../selectors';
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

  it('fetches multiple pages across multiple sources', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 15},
      'testbook1-testpage11-uuid': {[HighlightColorEnum.Green]: 5},
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 15},
    }, new Map()));

    const page1 = Array.from(new Array(15).keys()).map((index) => ({
      id: 'highlight' + index,
      sourceId: 'testbook1-testpage1-uuid',
    })) as HighlightData[];

    const page2 = Array.from(new Array(5).keys()).map((index) => ({
      id: 'highlight' + (15 + index),
      sourceId: 'testbook1-testpage2-uuid',
    })) as HighlightData[];

    const highlights = [
      ...page1,
      ...page2,
    ];

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: highlights,
        meta: {
          page: 1,
          perPage: 20,
          totalCount: 30,
        },
      }))
    ;

    const locationIds = ['testbook1-testpage1-uuid', 'testbook1-testchapter1-uuid'];
    await hook(store.dispatch(setSummaryFilters({locationIds})));
    const filters = summaryFilters(store.getState());

    const response: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage2-uuid': page2,
      },
      'testbook1-testpage1-uuid': {
        'testbook1-testpage1-uuid': page1,
      },
    };

    expect(highlightClient).lastCalledWith(expect.objectContaining({
      page: 1,
    }));
    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response, {
      filters,
      pagination: {
        page: 1,
        perPage: 20,
        sourceIds: ['testbook1-testpage1-uuid', 'testbook1-testpage2-uuid'],
      },
    }));

    const page3 = Array.from(new Array(10).keys()).map((_, index) => ({
      id: 'highlight' + (20 + index),
      sourceId: 'testbook1-testpage2-uuid',
    })) as HighlightData[];

    const page4 = Array.from(new Array(5).keys()).map((_, index) => ({
      id: 'highlight' + (30 + index),
      sourceId: 'testbook1-testpage11-uuid',
    })) as HighlightData[];

    highlightClient
      .mockReturnValueOnce(Promise.resolve({
        data: page3,
        meta: {
          page: 1,
          perPage: 20,
          totalCount: 30,
        },
      }))
      .mockReturnValueOnce(Promise.resolve({
        data: page4,
        meta: {
          page: 1,
          perPage: 20,
          totalCount: 5,
        },
      }))
    ;

    await hook(store.dispatch(loadMoreSummaryHighlights()));

    const response2: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage11-uuid': page4,
        'testbook1-testpage2-uuid': page3,
      },
    };

    expect(highlightClient).toHaveBeenCalledTimes(3);
    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response2, {pagination: null, filters}));
  });

  it('receive summary data for selected page', async() => {
    const pageId = 'testbook1-testpage9-uuid';

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 1},
    }, new Map([
      [pageId, assertDefined(findArchiveTreeNodeById(book.tree, pageId), '')],
    ])));

    const state = store.getState();
    const locationFilters = summaryLocationFilters(state);
    const colorFilters = summaryColorFilters(state);
    expect(locationFilters.size).toEqual(1);
    expect(colorFilters.size).toEqual(1);

    const highlights = [{
      id: 'highlight1',
      sourceId: pageId,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: highlights as HighlightData[],
        meta: {
          page: 1,
          perPage: 1,
          totalCount: 1,
        },
      }))
    ;

    const locationIds = [pageId];
    await hook(store.dispatch(setSummaryFilters({locationIds})));
    const filters = summaryFilters(store.getState());

    const response: SummaryHighlights = {
      [stripIdVersion(pageId)]: {
        [stripIdVersion(pageId)]: [{
          id: 'highlight1',
          sourceId: pageId,
        } as HighlightData],
      },
    };

    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response, {pagination: null, filters}));
  });

  it('receive summary data for selected page in chapter', async() => {
    const chapterIdForPageInChapter = 'testbook1-testchapter5-uuid';

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...pageInChapter, references: []}));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageInChapter.id]: {[HighlightColorEnum.Green]: 1},
    }, new Map([
      [chapterIdForPageInChapter, assertDefined(findArchiveTreeNodeById(book.tree, chapterIdForPageInChapter), '')],
    ])));

    const state = store.getState();
    const locationFilters = summaryLocationFilters(state);
    const colorFilters = summaryColorFilters(state);
    expect(locationFilters.size).toEqual(1);
    expect(colorFilters.size).toEqual(1);

    const highlights = [{
      id: 'highlight1',
      sourceId: pageInChapter.id,
    }];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: highlights as HighlightData[],
        meta: {
          page: 1,
          perPage: 1,
          totalCount: 1,
        },
      }))
    ;

    const locationIds = [chapterIdForPageInChapter];
    await hook(store.dispatch(setSummaryFilters({locationIds})));
    const filters = summaryFilters(store.getState());

    const response: SummaryHighlights = {
      [chapterIdForPageInChapter]: {
        [pageInChapter.id]: [{
          id: 'highlight1',
          sourceId: pageInChapter.id,
        } as HighlightData],
      },
    };

    expect(dispatch).lastCalledWith(receiveSummaryHighlights(response, {pagination: null, filters}));
  });

  it('noops without book', async() => {
    await hook(store.dispatch(setSummaryFilters({
      colors: [],
      locationIds: [],
    })));
    const filters = summaryFilters(store.getState());
    expect(helpers.highlightClient.getHighlights).not.toBeCalled();
    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}, {pagination: null, filters}));
  });

  it('return before api call when there are no filters', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    await hook(store.dispatch(setSummaryFilters({
      colors: [],
      locationIds: [],
    })));

    const filters = summaryFilters(store.getState());

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));

    expect(helpers.highlightClient.getHighlights).not.toBeCalled();
    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}, {pagination: null, filters}));
  });

  it('handle case for no highlights.data', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    await hook(store.dispatch(setSummaryFilters({
      colors: [HighlightColorEnum.Blue],
      locationIds: ['testbook1-testchapter1-uuid'],
    })));

    const filters = summaryFilters(store.getState());

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));

    expect(dispatch).toBeCalledWith(receiveSummaryHighlights({}, {pagination: null, filters}));
  });

  it('throws HighlightPopupLoadError', async() => {
    expect.assertions(3);
    const error = {} as any;
    const pageId = 'testbook1-testpage9-uuid';

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockRejectedValueOnce(error);

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 1},
    }, new Map([
      [pageId, assertDefined(findArchiveTreeNodeById(book.tree, pageId), '')],
    ])));

    const locationIds = [pageId];
    try {
      await hook(store.dispatch(setSummaryFilters({locationIds})));
    } catch (error) {
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.popUp.load);
      expect(error.meta).toEqual({ destination: 'myHighlights' });
    }
  });

  it('throws CustomApplicationError', async() => {
    expect.assertions(2);
    const mockCustomApplicationError = new CustomApplicationError('error');
    const pageId = 'testbook1-testpage9-uuid';

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockRejectedValueOnce(mockCustomApplicationError);

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 1},
    }, new Map([
      [pageId, assertDefined(findArchiveTreeNodeById(book.tree, pageId), '')],
    ])));

    const locationIds = [pageId];
    try {
      await hook(store.dispatch(setSummaryFilters({locationIds})));
    } catch (error) {
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(error.name).toEqual('CustomApplicationError');
    }
  });
});
