import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import mockHighlight from '../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import { resetModules } from '../../../../test/utils';
import { receivePageFocus } from '../../../actions';
import { receiveUser } from '../../../auth/actions';
import { formatUser } from '../../../auth/utils';
import { locationChange } from '../../../navigation/actions';
import { createNavigationOptions } from '../../../navigation/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { focusHighlight, receiveHighlights } from '../actions';
import { HighlightData } from '../types';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./locationChange').default)(helpers);
  });

  it('noops with no book', () => {
    store.dispatch(receivePage({...page, references: []}));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no page', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no pageFocus action', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];
    store.dispatch(receiveHighlights({highlights, pageId: page.id}));

    hook(locationChange({} as any));

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops when focus is leaving', () => {
    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    store.dispatch(receiveHighlights({highlights, pageId: page.id}));

    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook(receivePageFocus(false));

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops when highlights for specific page are already loading', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    store.dispatch(receiveHighlights({highlights: [], pageId: page.id}));

    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    await hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('receives highlights', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights, meta: {perPage: 200, page: 1, totalCount: 1}}));

    await hook();

    expect(dispatch).toHaveBeenCalledWith(receiveHighlights({highlights, pageId: page.id}));
  });

  it('receives multiple pages of highlights', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const highlights1 = [{id: mockHighlight().id} as HighlightData];
    const highlights2 = [{id: mockHighlight().id} as HighlightData];
    const highlights = [...highlights1, ...highlights2];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({data: highlights1, meta: {perPage: 1, page: 1, totalCount: 2}}))
      .mockReturnValueOnce(Promise.resolve({data: highlights2, meta: {perPage: 1, page: 2, totalCount: 2}}))
      .mockReturnValue(Promise.resolve({}))
    ;

    await hook();

    expect(dispatch).toHaveBeenCalledWith(receiveHighlights({highlights, pageId: page.id}));
  });

  it('focuses scroll target highlight', async() => {
    const scrollTarget = {
      elementId: 'doesntmatter',
      id: 'cool-id',
      type: 'highlight',
    };

    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        hash: 'hash',
        pathname: '',
        search: createNavigationOptions({}, scrollTarget).search,
        state: {},
      },
    }));

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const highlights = [{id: scrollTarget.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights, meta: {perPage: 1, page: 1, totalCount: 1}}));

    await hook();

    expect(dispatch).toHaveBeenCalledWith(focusHighlight('cool-id'));
  });
});
