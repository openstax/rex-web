import { ApplicationMesssageError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow, CustomApplicationError } from '../../../utils';
import {
  closeStudyGuides,
  printStudyGuides,
  receiveSummaryStudyGuides,
  toggleStudyGuidesSummaryLoading
} from '../actions';
import { initialState } from '../reducer';

describe('printStudyGuides', () => {
  const formattedHighlights = {};
  let store: Store;
  let dispatch: jest.SpyInstance;
  let calmSpy: jest.SpyInstance;
  let loadMore: jest.SpyInstance;
  let print: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let asyncHelper: typeof import ('./printStudyGuides').asyncHelper;
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

    asyncHelper = (require('./printStudyGuides').asyncHelper);
    hook = (require('./printStudyGuides').hookBody)(helpers);
  });

  it('throws ApplicationMesssageError', async() => {
    expect.assertions(3);
    const error = {} as any;
    const mockApplicationMesssageError = new ApplicationMesssageError(
      toastMessageKeys.studyGuides.failure.popUp.print,
      { destination: 'studyGuides' });

    loadMore.mockRejectedValueOnce(error);

    try {
      await hook(printStudyGuides());
    } catch (error) {
      expect(dispatch).toBeCalledWith(toggleStudyGuidesSummaryLoading(false));
      expect(error.messageKey).toBe(mockApplicationMesssageError.messageKey);
      expect(error.meta).toEqual(mockApplicationMesssageError.meta);
    }
  });

  it('throws CustomApplicationError', async() => {
    const mockCustomApplicationError = new CustomApplicationError();

    jest.spyOn(require('./loadMore'), 'loadMore')
      .mockRejectedValueOnce(mockCustomApplicationError);
    try {
      await hook(printStudyGuides());
    } catch (error) {
      expect(dispatch).toBeCalledWith(toggleStudyGuidesSummaryLoading(false));
      expect(error.name).toEqual('CustomApplicationError');
    }
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

    expect(dispatch).toBeCalledWith(toggleStudyGuidesSummaryLoading(false));
    expect(print).toHaveBeenCalled();
  });

  it('doesn\'t wait for promiseCollector.calm', async() => {
    // waitingForPromiseCollector is false
    await asyncHelper(helpers);

    expect(loadMore).toHaveBeenCalled();
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(receiveSummaryStudyGuides(formattedHighlights, {
      isStillLoading: true,
      pagination: null,
    }));

    expect(calmSpy).not.toHaveBeenCalled();
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
