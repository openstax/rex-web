import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
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
