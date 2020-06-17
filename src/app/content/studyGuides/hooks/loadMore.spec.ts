import { HighlightColorEnum, GetHighlightsSetsEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { HighlightData, SummaryHighlights } from '../../types';
import { formatBookData } from '../../utils';
import {
  loadMoreStudyGuides,
  receiveStudyGuidesTotalCounts,
  receiveSummaryStudyGuides,
} from '../actions';
import { allColors } from '../constants';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

const createTestHighlights = ({
  amount,
  startIdsFrom,
  sourceId,
}: {
  amount: number,
  startIdsFrom?: number,
  sourceId: string
}) => Array.from({length: amount}, (_, index) => ({
    id: 'highlight' + (startIdsFrom || 0 + index),
    sourceId,
  })) as HighlightData[];

describe('loadMore', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let loadingSpy: jest.SpyInstance;
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
    loadingSpy = jest.spyOn(require('../../utils/highlightLoadingUtils'), 'loadUntilPageSize');
    hook = (require('./loadMore').hookBody)(helpers);
  });

  it('fetches multiple pages across multiple sources', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveStudyGuidesTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 15},
      'testbook1-testpage11-uuid': {[HighlightColorEnum.Green]: 5},
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 15},
    }));

    const page1 = createTestHighlights({
      amount: 15,
      sourceId: 'testbook1-testpage1-uuid',
    });

    const page2 = createTestHighlights({
      amount: 5,
      sourceId: 'testbook1-testpage2-uuid',
      startIdsFrom: page1.length,
    });

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

    const response: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage2-uuid': page2,
      },
      'testbook1-testpage1-uuid': {
        'testbook1-testpage1-uuid': page1,
      },
    };

    await hook(loadMoreStudyGuides());

    expect(highlightClient).lastCalledWith(expect.objectContaining({
      page: 1,
    }));
    expect(dispatch).lastCalledWith(receiveSummaryStudyGuides(response, {
      page: 1,
      perPage: 20,
      sourceIds: ['testbook1-testpage1-uuid', 'testbook1-testpage2-uuid'],
    }));

    const page3 = createTestHighlights({
      amount: 10,
      sourceId: 'testbook1-testpage2-uuid',
      startIdsFrom: page1.length + page2.length,
    });

    const page4 = createTestHighlights({
      amount: 5,
      sourceId: 'testbook1-testpage11-uuid',
      startIdsFrom: page1.length + page2.length + page3.length,
    });

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

    await hook(store.dispatch(loadMoreStudyGuides()));

    const response2: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage11-uuid': page4,
        'testbook1-testpage2-uuid': page3,
      },
    };

    expect(loadingSpy).toHaveBeenCalled();
    expect(highlightClient).toHaveBeenCalledTimes(3);
    expect(dispatch).lastCalledWith(receiveSummaryStudyGuides(response2, null));
  });

  it('calls loadUntilPageSize with correct parameters', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveStudyGuidesTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 5},
    }));

    const page1 = createTestHighlights({
      amount: 5,
      sourceId: 'testbook1-testpage1-uuid',
    });

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: page1,
        meta: {
          page: 1,
          perPage: 20,
          totalCount: 5,
        },
      }))
    ;

    const response: SummaryHighlights = {
      'testbook1-testpage1-uuid': {
        'testbook1-testpage1-uuid': page1,
      },
    };

    await hook(store.dispatch(loadMoreStudyGuides()));

    expect(loadingSpy).toHaveBeenCalledWith(expect.objectContaining({
      book,
      colors: allColors,
      sets: [GetHighlightsSetsEnum.Curatedopenstax],
    }));
    expect(highlightClient).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receiveSummaryStudyGuides(response, null));
  });
});
