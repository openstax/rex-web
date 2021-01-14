import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { assertDefined, CustomApplicationError } from '../../../utils';
import { receiveBook } from '../../actions';
import * as contentSelectors from '../../selectors';
import { formatBookData } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import {
  initializeMyHighlightsSummary,
  receiveHighlightsTotalCounts,
  receiveSummaryHighlights,
  toggleSummaryHighlightsLoading
} from '../actions';
import * as selectors from '../selectors';
import { HighlightData } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);

describe('initializeMyHighlightsSummaryHook', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./initializeMyHighlightsSummary').hookBody>;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./initializeMyHighlightsSummary').hookBody)(helpers);
  });

  it('dispatches totals and summary highlgihts', async() => {
    const totalCountsPerPage = {
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 1},
    };

    const highlights = [{
      id: 'highlight1',
      sourceId: 'testbook1-testpage1-uuid',
    }];

    jest.spyOn(contentSelectors, 'book').mockReturnValue(book);
    jest.spyOn(selectors, 'summaryHighlights').mockReturnValue(null);
    jest.spyOn(selectors, 'summaryIsLoading').mockReturnValue(false);
    jest.spyOn(selectors, 'filteredCountsPerPage').mockReturnValue(totalCountsPerPage);
    jest.spyOn(selectors, 'highlightLocationFilters').mockReturnValue(new Map([[
      'testbook1-testpage1-uuid', assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage1-uuid'), ''),
    ]]));

    jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(Promise.resolve({ countsPerSource: totalCountsPerPage }));

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

    await hook(initializeMyHighlightsSummary());

    expect(dispatch).toHaveBeenCalledWith(receiveHighlightsTotalCounts(
      expect.anything(),
      expect.anything()
    ));

    expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights(
      expect.anything(), {pagination: null}
    ));
  });

  it('throws HighlightPopupLoadError when summary request fails', async() => {
    const error = {} as any;

    store.dispatch(receiveBook(book));

    const getHighlightsSummaryClient = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockRejectedValueOnce(error);

    try {
      await hook(initializeMyHighlightsSummary());
    } catch (error) {
      expect(getHighlightsSummaryClient).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.popUp.load);
      expect(error.meta).toEqual({ destination: 'myHighlights' });
    }
  });

  it('throws CustomApplicationError when summary request fails', async() => {
    const mockCustomApplicationError = new CustomApplicationError('error');

    store.dispatch(receiveBook(book));

    const getHighlightsSummaryClient = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockRejectedValueOnce(mockCustomApplicationError);

    try {
      await hook(initializeMyHighlightsSummary());
    } catch (error) {
      expect(getHighlightsSummaryClient).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(error.name).toEqual('CustomApplicationError');
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });

  it('throws HighlightPopupLoadError when highlights request fails', async() => {
    const error = {} as any;

    jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockResolvedValueOnce({ countsPerSource: {} });

    const getHighlightsClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockRejectedValueOnce(error);

    try {
      await hook(initializeMyHighlightsSummary());
    } catch (error) {
      expect(getHighlightsClient).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.popUp.load);
      expect(error.meta).toEqual({ destination: 'myHighlights' });
    }
  });

  it('throws CustomApplicationError when highlights request fails', async() => {
    const mockCustomApplicationError = new CustomApplicationError('error');

    jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockResolvedValueOnce({ countsPerSource: {} });

    const getHighlightsClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockRejectedValueOnce(mockCustomApplicationError);

    try {
      await hook(initializeMyHighlightsSummary());
    } catch (error) {
      expect(getHighlightsClient).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(error.name).toEqual('CustomApplicationError');
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });

});
