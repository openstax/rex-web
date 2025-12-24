import { HighlightColorEnum } from '@openstax/highlights-client';
import queryString from 'query-string';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { receiveLoggedOut, receiveUser } from '../../../auth/actions';
import { locationChange, replace } from '../../../navigation/actions';
import { AnyMatch } from '../../../navigation/types';
import { MiddlewareAPI, Store } from '../../../types';
import { closeMobileMenu, receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import {
  loadMoreStudyGuides,
  openStudyGuides,
  receiveStudyGuidesTotalCounts,
} from '../actions';
import { colorfilterLabels } from '../constants';
import * as selectors from '../selectors';

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
    expect(dispatch).toHaveBeenCalledWith(closeMobileMenu());
    expect(dispatch).not.toHaveBeenCalledWith(loadMoreStudyGuides());
  });

  it('sets current chapter filter to the current page when user is logged in', async() => {
    store.dispatch(receiveUser({} as any));
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({ ...shortPage, references: [] }));

    await hook(openStudyGuides());

    const historyReplace = replace({} as unknown as AnyMatch, {
      search: `${queryString.stringify({colors: Array.from(colorfilterLabels)})}&locationIds=testbook1-testchapter3-uuid`,
    });
    expect(dispatch).toHaveBeenCalledWith(historyReplace);
  });

  it('sets current chapter filter to the first page when user is not logged in', async() => {
    store.dispatch(receiveLoggedOut());
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({ ...shortPage, references: [] }));

    await hook(openStudyGuides());

    const historyReplace = replace({} as unknown as AnyMatch, {
      search: `${queryString.stringify({colors: Array.from(colorfilterLabels)})}&locationIds=testbook1-testchapter1-uuid`,
    });
    expect(dispatch).toHaveBeenCalledWith(historyReplace);
  });

  it('sets colors from query', async() => {
    store.dispatch(locationChange({ location: { search: 'colors=blue' } } as any));
    store.dispatch(receiveLoggedOut());
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({ ...shortPage, references: [] }));

    await hook(openStudyGuides());

    expect(selectors.studyGuidesFilters(store.getState())).toEqual({
        colors: [HighlightColorEnum.Blue],
        locationIds: undefined,
    });
  });

  it('sets colors from colors with content', async() => {
    store.dispatch(locationChange({ location: { search: '' } } as any));
    store.dispatch(receiveLoggedOut());
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({ ...shortPage, references: [] }));
    store.dispatch(receiveStudyGuidesTotalCounts({
      countsPerSource: {
        green: 1,
      },
    }));

    await hook(openStudyGuides());

    const historyReplace = replace({} as unknown as AnyMatch, {
      search: `${queryString.stringify({colors: [HighlightColorEnum.Green]})}&locationIds=testbook1-testchapter1-uuid`,
    });
    expect(dispatch).toHaveBeenCalledWith(historyReplace);
  });
});
