import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { loadMoreStudyGuides, openStudyGuides } from '../actions';

jest.mock('./loadMore', () => ({
  loadMore: jest.fn(),
}));

describe('openStudyGuides', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./openStudyGuides').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./openStudyGuides').hookBody)(helpers);
  });

  it('loads highlights if study guides haven\'t been initialized', async() => {
    await hook(openStudyGuides());
    expect(dispatch).toHaveBeenCalledWith(loadMoreStudyGuides());
  });
  it('noops if study guides are being/were initialized', async() => {
    store.dispatch(loadMoreStudyGuides());
    await hook(openStudyGuides());
    expect(dispatch).not.toHaveBeenCalled();
  });
});
