import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { groupedToastNotifications } from '../../../notifications/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { closeStudyGuides, printStudyGuides, receiveStudyGuidesTotalCounts, receiveSummaryStudyGuides, setDefaultSummaryFilters } from '../actions';
import { initialState } from '../reducer';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

describe('printStudyGuides', () => {
  const formattedHighlights = {};
  let store: Store;
  let dispatch: jest.SpyInstance;
  let calmSpy: jest.SpyInstance;
  let loadMore: jest.SpyInstance;
  let print: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./printStudyGuides').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore({
      ...{} as any,
      content: {
        studyGuides: {
          ...initialState,
          summary: {
            ...initialState.summary,
            open: true,
          },
        },
      },
    });

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    const window = assertWindow();
    window.print = jest.fn();
    print = jest.spyOn(window, 'print');

    dispatch = jest.spyOn(helpers, 'dispatch');

    calmSpy = jest.spyOn(helpers.promiseCollector, 'calm')
      .mockImplementation(() => Promise.resolve());
    loadMore = jest.spyOn(require('./loadMore'), 'loadMore')
      .mockImplementation(async() => ({formattedHighlights}));

    hook = (require('./printStudyGuides').hookBody)(helpers);
  });

  it('doesn\'t return a promise', () => {
    expect(hook(printStudyGuides())).toBe(undefined);
    expect(loadMore).toHaveBeenCalled();
  });

  it.only('adds a toast on request error', async() => {
    const error = {} as any;

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockRejectedValueOnce(error);

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveStudyGuidesTotalCounts({
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
    }));
    store.dispatch(setDefaultSummaryFilters({locationIds: ['testbook1-testchapter1-uuid']}));

    await hook(store.dispatch(printStudyGuides()));

    expect(groupedToastNotifications(store.getState()).studyGuides)
      .toEqual([expect.objectContaining({messageKey: toastMessageKeys.studyGuides.failure.popUp.print})]);
  });

  it('waits for promiseCollector.calm', async() => {
    hook(printStudyGuides());

    expect(loadMore).toHaveBeenCalled();
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(receiveSummaryStudyGuides(formattedHighlights, {
      isStillLoading: true,
      pagination: null,
    }));

    expect(print).not.toHaveBeenCalled();

    expect(calmSpy).toHaveBeenCalled();
    await Promise.resolve();

    expect(print).toHaveBeenCalled();
  });

  it('doesn\'t print if study guides modal was closed', async() => {
    hook(printStudyGuides());

    expect(loadMore).toHaveBeenCalled();
    await Promise.resolve();

    store.dispatch(closeStudyGuides());

    expect(calmSpy).toHaveBeenCalled();
    await Promise.resolve();

    expect(print).not.toHaveBeenCalled();
  });
});
