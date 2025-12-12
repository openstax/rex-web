import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { ApplicationError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { maxHighlightsApiPageSize } from '../../constants';
import { formatBookData } from '../../utils';
import {
  closeMyHighlights,
  openMyHighlights,
  printSummaryHighlights,
  receiveHighlightsTotalCounts,
  receiveReadyToPrintHighlights,
  receiveSummaryHighlights,
  setSummaryFilters,
  toggleSummaryHighlightsLoading,
} from '../actions';
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

describe('printHighlights', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let calmSpy: jest.SpyInstance;
  const print = jest.fn();
  let asyncHelper: typeof import ('./printHighlights').asyncHelper;
  let hook: ReturnType<typeof import ('./printHighlights').hookBody>;

  beforeEach(() => {
    const window = assertWindow();
    window.print = print;
    print.mockClear();

    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');
    calmSpy = jest.spyOn(helpers.promiseCollector, 'calm')
      .mockImplementation(() => Promise.resolve());

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(openMyHighlights());

    asyncHelper = (require('./printHighlights').asyncHelper);
    hook = (require('./printHighlights').hookBody)(helpers);
  });

  describe('with unfetched resources', () => {
    beforeEach(() => {
      store.dispatch(receiveHighlightsTotalCounts({
        'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 210},
        'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
      }, new Map()));
      store.dispatch(setSummaryFilters({locationIds}));
    });

    it('fetches all highlights before print', async() => {
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
            page: 1,
            perPage: maxHighlightsApiPageSize,
            totalCount: page1.length + page2.length,
          },
        }))
        .mockReturnValueOnce(Promise.resolve({
          data: secondFetch,
          meta: {
            page: 2,
            perPage: maxHighlightsApiPageSize,
            totalCount: page1.length + page2.length,
          },
        }))
      ;
      await asyncHelper(helpers);
      expect(highlightClient).toHaveBeenCalledTimes(2);

      expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights(response, {
        isStillLoading: true,
        pagination: null,
      }));
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(dispatch).toHaveBeenCalledWith(receiveReadyToPrintHighlights(true));
    });

    it('doesn\'t trigger print if myhighlights are closed', async() => {
      store.dispatch(receiveSummaryHighlights({
        'testbook1-testchapter1-uuid': {
          'testbook1-testpage2-uuid': page2,
        },
        'testbook1-testpage1-uuid': {
          'testbook1-testpage1-uuid': page1,
        },
      }, {pagination: null}));
      store.dispatch(closeMyHighlights());

      await asyncHelper(helpers);

      expect(print).not.toHaveBeenCalled();
    });

    it('uses pagination from previous requests', async() => {
      const firstFetch = page1.slice(105);
      const secondFetch = page2;

      const response: SummaryHighlights = {
        'testbook1-testchapter1-uuid': {
          'testbook1-testpage2-uuid': secondFetch,
        },
        'testbook1-testpage1-uuid': {
          'testbook1-testpage1-uuid': firstFetch,
        },
      };

      const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockReturnValueOnce(Promise.resolve({
          data: firstFetch,
          meta: {
            page: 2,
            perPage: 105,
            totalCount: page1.length,
          },
        }))
        .mockReturnValueOnce(Promise.resolve({
          data: secondFetch,
          meta: {
            page: 1,
            perPage: maxHighlightsApiPageSize,
            totalCount: page2.length,
          },
        }))
      ;

      // meant to immitate fetched highlights before triggering print
      store.dispatch(receiveSummaryHighlights({
          'testbook1-testpage1-uuid': {
            'testbook1-testpage1-uuid': page1.slice(0, 105),
          },
        }, {
        pagination: {
          page: 1,
          perPage: 105,
          sourceIds: locationIds,
        },
      }));

      await asyncHelper(helpers);
      expect(highlightClient).toHaveBeenCalledTimes(2);

      expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights(response, {
        isStillLoading: true,
        pagination: null,
      }));
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(dispatch).toHaveBeenCalledWith(receiveReadyToPrintHighlights(true));
    });

    it('waits for promiseCollector.calm', async() => {
      const loadMore = jest.spyOn(require('./loadMore'), 'loadMore')
        .mockImplementation(async() => ({}));

      hook(printSummaryHighlights());

      expect(loadMore).toHaveBeenCalled();
      await Promise.resolve();

      expect(print).not.toHaveBeenCalled();

      expect(calmSpy).toHaveBeenCalled();
      await Promise.resolve();

      expect(dispatch).toBeCalledWith(toggleSummaryHighlightsLoading(false));
      expect(dispatch).toBeCalledWith(receiveReadyToPrintHighlights(true));

      loadMore.mockRestore();
    });

    it('throws HighlightPopupPrintError', async() => {
      expect.assertions(3);
      const error = {} as any;

      jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockRejectedValueOnce(error);

      try {
        await asyncHelper(helpers);
      } catch (error: any) {
        expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
        expect(error.messageKey).toBe(toastMessageKeys.highlights.failure.popUp.print);
        expect(error.meta).toEqual({ destination: 'myHighlights' });
      }
    });

    it('throws ApplicationError', async() => {
      expect.assertions(3);
      const mockCustomApplicationError = new ApplicationError('error');

      jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockRejectedValueOnce(mockCustomApplicationError);

      try {
        await asyncHelper(helpers);
      } catch (error: any) {
        expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
        expect(error instanceof ApplicationError).toEqual(true);
        expect(error.message).toBe(mockCustomApplicationError.message);
      }
    });
  });

  describe('with all resources fetched', () => {
    it('doesn\'t call highlight client', async() => {
      const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights');

      await asyncHelper(helpers);

      expect(highlightClient).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights({}, {
        isStillLoading: true,
        pagination: null,
      }));
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(dispatch).toHaveBeenCalledWith(receiveReadyToPrintHighlights(true));
    });
  });
});
