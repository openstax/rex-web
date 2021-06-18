import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { receiveLoggedOut, receiveUser } from '../../../auth/actions';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import {
  loadMoreStudyGuides,
  openStudyGuides,
  setDefaultSummaryFilters
} from '../actions';
import { colorfilterLabels } from '../constants';

jest.mock('./loadMore', () => ({
  loadMore: jest.fn(),
}));

describe('openStudyGuides', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./openStudyGuides').hookBody>;
  const book = formatBookData(archiveBook, mockCmsBook);

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
    expect(dispatch).not.toHaveBeenCalledWith(setDefaultSummaryFilters(expect.anything()));
  });

  it('sets current chapter filter to the current page when user is logged in', async() => {
    store.dispatch(receiveUser({} as any));
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({ ...shortPage, references: [] }));

    await hook(openStudyGuides());
    expect(dispatch).toHaveBeenCalledWith(
      setDefaultSummaryFilters({
        colors: Array.from(colorfilterLabels),
        locationIds: ['testbook1-testchapter3-uuid'],
      })
    );
  });

  it('sets current chapter filter to the first page when user is not logged in', async() => {
    store.dispatch(receiveLoggedOut());
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({ ...shortPage, references: [] }));

    await hook(openStudyGuides());
    expect(dispatch).toHaveBeenCalledWith(
      setDefaultSummaryFilters({
        colors: Array.from(colorfilterLabels),
        locationIds: ['testbook1-testchapter1-uuid'],
      })
    );
  });
});
