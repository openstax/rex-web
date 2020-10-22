import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import * as authSelectors from '../../../auth/selectors';
import { formatUser } from '../../../auth/utils';
import { push } from '../../../navigation/actions';
import { MiddlewareAPI, Store } from '../../../types';
import { initialState as initialContentState } from '../../reducer';
import { initializeMyHighlightsSummary, openMyHighlights } from '../actions';
import * as selectors from '../selectors';

describe('openMyHighlightsHook', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./openMyHighlights').hookBody>;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore({
      content: {
        ...initialContentState,
        params: {
          book: { slug: 'book' },
          page: { slug: 'page' },
        },
      },
    });

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./openMyHighlights').hookBody)(helpers);
  });

  it('dispatches init', async() => {
    jest.spyOn(authSelectors, 'user').mockReturnValue(formatUser(testAccountsUser));
    jest.spyOn(selectors, 'summaryHighlights').mockReturnValue(null);
    jest.spyOn(selectors, 'summaryIsLoading').mockReturnValue(false);

    await hook(openMyHighlights());

    expect(dispatch).toHaveBeenCalledWith(initializeMyHighlightsSummary());
  });

  it('adds query parameter for my highlights modal', async() => {
    await hook(openMyHighlights());
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({search: 'modal=MH'}),
    }));
  });

  it('doesn\'t dispatch init if not authenticated', async() => {
    jest.spyOn(authSelectors, 'user').mockReturnValue(undefined);
    jest.spyOn(selectors, 'summaryHighlights').mockReturnValue(null);
    jest.spyOn(selectors, 'summaryIsLoading').mockReturnValue(false);

    await hook(openMyHighlights());

    expect(dispatch).not.toHaveBeenCalledWith(initializeMyHighlightsSummary());
  });

  it('doesn\'t dispatch init if loading', async() => {
    jest.spyOn(authSelectors, 'user').mockReturnValue(formatUser(testAccountsUser));
    jest.spyOn(selectors, 'summaryHighlights').mockReturnValue(null);
    jest.spyOn(selectors, 'summaryIsLoading').mockReturnValue(true);

    await hook(openMyHighlights());

    expect(dispatch).not.toHaveBeenCalledWith(initializeMyHighlightsSummary());
  });

  it('doesn\'t dispatch init if already initialized', async() => {
    jest.spyOn(authSelectors, 'user').mockReturnValue(formatUser(testAccountsUser));
    jest.spyOn(selectors, 'summaryHighlights').mockReturnValue({});
    jest.spyOn(selectors, 'summaryIsLoading').mockReturnValue(false);

    await hook(openMyHighlights());

    expect(dispatch).not.toHaveBeenCalledWith(initializeMyHighlightsSummary());
  });
});
