import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import noop from 'lodash/fp/noop';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import {
  printSummaryHighlights,
  receiveHighlightsTotalCounts,
  receiveSummaryHighlights,
  setSummaryFilters
} from '../actions';
import { maxHighlightsPerPage } from '../constants';
import { HighlightData, SummaryHighlights } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

const locationIds = ['testbook1-testpage1-uuid', 'testbook1-testchapter1-uuid'];

const page1 = Array.from(new Array(210).keys()).map((index) => ({
  id: 'highlight' + index,
  sourceId: 'testbook1-testpage1-uuid',
})) as HighlightData[];

const page2 = Array.from(new Array(5).keys()).map((index) => ({
  id: 'highlight' + (210 + index),
  sourceId: 'testbook1-testpage2-uuid',
})) as HighlightData[];

describe('filtersChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let print: jest.SpyInstance;
  let hook: ReturnType<typeof import ('./printHighlights').hookBody>;

  beforeEach(() => {
    print = jest.spyOn(assertWindow(), 'print');
    print.mockImplementation(noop);
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./printHighlights').hookBody)(helpers);
  });

  it('fetches all highlights before print', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 210},
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
    }, new Map()));

    const firstFetch = page1.slice(0, 200);
    const secondFetch = [...page1.slice(200), ...page2];

    const response: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage2-uuid': page2,
      },
      'testbook1-testpage1-uuid': {
        'testbook1-testpage1-uuid': page1,
      },
    };

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: firstFetch,
        meta: {
          perPage: maxHighlightsPerPage,
          totalCount: page1.length + page2.length,
        },
      }))
      .mockReturnValueOnce(Promise.resolve({
        data: secondFetch,
        meta: {
          perPage: maxHighlightsPerPage,
          totalCount: page1.length + page2.length,
        },
      }))
    ;

    store.dispatch(setSummaryFilters({locationIds}));
    await hook(printSummaryHighlights());
    expect(highlightClient).toHaveBeenCalledTimes(2);

    expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights(response, null));
    expect(print).toHaveBeenCalled();
  });

  it('noops if all sources have been fetched', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 210},
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
    }, new Map()));

    store.dispatch(setSummaryFilters({locationIds}));
    store.dispatch(receiveSummaryHighlights({
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage2-uuid': page2,
      },
      'testbook1-testpage1-uuid': {
        'testbook1-testpage1-uuid': page1,
      },
    }, null));

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights');

    await hook(printSummaryHighlights());

    expect(highlightClient).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();

    expect(print).toHaveBeenCalled();
  });
});
