import { Location } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import { combineReducers, createStore } from 'redux';
import FontCollector from '../../../helpers/FontCollector';
import PromiseCollector from '../../../helpers/PromiseCollector';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import mockOSWebLoader from '../../../test/mocks/osWebLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { Match } from '../../navigation/types';
import { AppServices, AppState, MiddlewareAPI } from '../../types';
import * as actions from '../actions';
import reducer, { initialState } from '../reducer';
import * as routes from '../routes';
import { State } from '../types';
import { formatBookData } from '../utils';

describe('locationChange', () => {
  let localState: State;
  let appState: AppState;
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;
  let payload: {location: Location, match: Match<typeof routes.content>};
  let hook = require('./locationChange').default;

  beforeEach(() => {
    localState = cloneDeep(initialState);
    appState = {content: localState} as AppState;

    const store = createStore(combineReducers({content: reducer}), appState);

    archiveLoader = mockArchiveLoader();

    dispatch = jest.fn((action) => store.dispatch(action));

    helpers = {
      archiveLoader,
      dispatch,
      fontCollector: new FontCollector(),
      getState: store.getState,
      osWebLoader: mockOSWebLoader(),
      promiseCollector: new PromiseCollector(),
    } as any as MiddlewareAPI & AppServices;

    payload = {
      location: {} as Location,
      match: {
        params: {
          book: 'book-slug-1',
          page: 'test-page-1',
        },
        route: routes.content,
      },
    };

    hook = (require('./locationChange').default)(helpers);
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('loads book', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook('book-slug-1'));
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', '1.0');
  });

  it('doesn\'t load book if its already loaded', async() => {
    localState.book = cloneDeep({...formatBookData(book, mockCmsBook), slug: 'book'});
    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('book'));
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('doesn\'t load book if its already loading', async() => {
    archiveLoader.mock.loadBook.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
    );

    await Promise.all([
      hook(payload),
      hook(payload),
      hook(payload),
    ]);

    expect(dispatch).toHaveBeenCalledTimes(4);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook('book-slug-1'));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
    expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
    expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));
  });

  it('loads page', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('test-page-1'));
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('doesn\'t load page if its already loaded', async() => {
    localState.page = cloneDeep(page);

    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage(expect.anything()));
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', expect.anything());
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('pagelongid', expect.anything());
  });

  it('doesn\'t load page if its already loading', async() => {
    await Promise.all([
      hook(payload),
      hook(payload),
      hook(payload),
      hook(payload),
    ]);

    expect(dispatch).toHaveBeenCalledTimes(4);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook('book-slug-1'));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
    expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
    expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));

    expect(archiveLoader.mock.loadPage).toHaveBeenCalledTimes(1);
  });

  it.skip('adds font to fontcollector', () => {
    const mockFont = 'https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i|Roboto+Condensed:300,300i,400,400i,700,700i'; // tslint:disable-line:max-line-length
    jest.mock('cnx-recipes', () => ({
      getBookStyles: () => {
        const styles = new Map();
        styles.set('intro-business', `@import url("${mockFont}");`);
        return styles;
      },
    }));

    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(payload);
    expect(spy).toHaveBeenCalledWith(mockFont);
  });

  it('doesn\'t break if there are no fonts in the css', () => {
    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(payload);
    expect(spy).not.toHaveBeenCalled();
  });

  it('loads more specific data when available', async() => {
    payload.match.state = {
      bookUid: 'testbook1-uuid',
      bookVersion: '1.0',
      pageUid: 'testbook1-testpage1-uuid',
    };

    await hook(payload);
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', '1.0');
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('loads a page with a content reference', async() => {
    archiveLoader.mockPage(book, {
      content: 'rando content',
      id: 'rando-page-id',
      shortId: 'rando-page-shortid',
      title: 'rando page',
      version: '0',
    });
    archiveLoader.mockPage(book, {
      content: 'some /contents/rando-page-id content',
      id: 'asdfasfasdfasdf',
      shortId: 'asdf',
      title: 'qwerqewrqwer',
      version: '0',
    });

    payload.match.params.page = 'qwerqewrqwer';

    payload.match.state = {
      bookUid: 'testbook1-uuid',
      bookVersion: '1.0',
      pageUid: 'asdfasfasdfasdf',
    };

    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
      match: '/contents/rando-page-id',
      params: {
        book: 'book-slug-1',
        page: 'rando-page',
      },
      state: {
        bookUid: 'testbook1-uuid',
        bookVersion: '1.0',
        pageUid: 'rando-page-id',
      },
    }]})}));
  });

  it('throws on cross book reference', async() => {
    archiveLoader.mockPage(book, {
      content: 'some /contents/book:pagelongid content',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    });

    payload.match.params = {
      book: 'book',
      page: 'qerqwer',
    };

    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('BUG: Cross book references are not supported');
  });

  it('throws on reference to unknown id', async() => {
    archiveLoader.mockPage(book, {
      content: 'some /contents/qwerqwer content',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    });

    payload.match.params.page = 'qerqwer';

    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('BUG: qwerqwer is not present in the ToC');
  });

  it('throws on unknown id', async() => {
    payload.match.params.page = 'garbage';
    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('Page not found');
  });

  it('loads book details from osweb', async() => {
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).toHaveBeenCalledWith('book-slug-1');
  });

  it('caches book details from osweb', async() => {
    await hook(payload);
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t call osweb if book slug is already known', async() => {
    localState.book = formatBookData(book, mockCmsBook);
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).not.toHaveBeenCalled();
  });
});
