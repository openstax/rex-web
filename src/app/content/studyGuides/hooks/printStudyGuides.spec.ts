import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { groupedToastNotifications } from '../../../notifications/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { closeStudyGuides, printStudyGuides, receiveSummaryStudyGuides } from '../actions';
import { initialState } from '../reducer';

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
    jest.resetAllMocks();

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
      .mockReturnValue(Promise.resolve());

    loadMore = jest.spyOn(require('./loadMore'), 'loadMore')
      .mockImplementation(async() => ({formattedHighlights}));

    hook = (require('./printStudyGuides').hookBody)(helpers);
  });

  it('doesn\'t return a promise', () => {
    expect(hook(printStudyGuides())).toBe(undefined);
    expect(loadMore).toHaveBeenCalled();
  });

  it('adds a toast on request error', async() => {
    const error = {} as any;

    loadMore.mockRejectedValueOnce(error);

    hook(printStudyGuides());
    await new Promise((resolve) => setImmediate(resolve)); // clear promise queue

    expect(groupedToastNotifications(store.getState()).studyGuides)
      .toEqual([expect.objectContaining({messageKey: toastMessageKeys.studyGuides.failure.popUp.print})]);
  });

  it('waits for promiseCollector.calm', async() => {
    let resolveCalm: undefined | (() => void);

    calmSpy.mockReturnValue(new Promise((resolve) => {
      resolveCalm = resolve;
    }));

    if (!resolveCalm) {
      return expect(resolveCalm).toBeTruthy();
    }

    hook(printStudyGuides());

    expect(loadMore).toHaveBeenCalled();
    await new Promise((resolve) => setImmediate(resolve)); // clear promise queue

    expect(dispatch).toHaveBeenCalledWith(receiveSummaryStudyGuides(formattedHighlights, {
      isStillLoading: true,
      pagination: null,
    }));

    expect(print).not.toHaveBeenCalled();

    resolveCalm();

    await new Promise((resolve) => setImmediate(resolve)); // clear promise queue

    expect(print).toHaveBeenCalled();
  });

  it('doesn\'t print if study guides modal was closed', async() => {
    let resolveCalm: undefined | (() => void);

    calmSpy.mockReturnValue(new Promise((resolve) => {
      resolveCalm = resolve;
    }));

    if (!resolveCalm) {
      return expect(resolveCalm).toBeTruthy();
    }

    hook(printStudyGuides());

    expect(loadMore).toHaveBeenCalled();
    await new Promise((resolve) => setImmediate(resolve)); // clear promise queue

    store.dispatch(closeStudyGuides());

    resolveCalm();

    await new Promise((resolve) => setImmediate(resolve)); // clear promise queue

    expect(print).not.toHaveBeenCalled();
  });
});
