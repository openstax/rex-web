import createTestServices from '../../test/createTestServices';
import createTestStore from '../../test/createTestStore';
import { book, page } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../test/utils';
import { locationChange } from '../navigation/actions';
import { Match } from '../navigation/types';
import { AppServices } from '../types';

const longID = 'longidin-vali-dfor-mat1-111111111111';

describe('content route', () => {
  let content: any;
  let React: any;
  let renderer: any;
  let createApp: any;

  describe('generates urls', () => {
    it('for book slug and page slug', () => {
      content = require('./routes').content;
      const url = content.getUrl({book: {slug: 'book'}, page: {slug: 'page'}});
      expect(url).toEqual('/books/book/pages/page');
    });

    it('for book slug with version and page slug', () => {
      content = require('./routes').content;
      const url = content.getUrl({book: {slug: 'book', contentVersion: 'asdf'}, page: {slug: 'page'}});
      expect(url).toEqual('/books/book@asdf/pages/page');
    });

    it('for book uuid with version and page slug', () => {
      content = require('./routes').content;
      const url = content.getUrl({
        book: {
          contentVersion: '1.0',
          uuid: longID,
        },
        page: {
          slug: 'page',
        }});
      expect(url).toEqual('/books/longidin-vali-dfor-mat1-111111111111@1.0/pages/page');
    });

    it('for book slug and page uuid', () => {
      content = require('./routes').content;
      const url = content.getUrl({book: {slug: 'book'}, page: {uuid: longID}});
      expect(url).toEqual('/books/book/pages/longidin-vali-dfor-mat1-111111111111');
    });

    it('for book slug with version and page uuid', () => {
      content = require('./routes').content;
      const url = content.getUrl({book: {slug: 'book', contentVersion: 'asdf'}, page: {uuid: longID}});
      expect(url).toEqual('/books/book@asdf/pages/longidin-vali-dfor-mat1-111111111111');
    });

    it('for book uuid with version and page uuid', () => {
      content = require('./routes').content;
      const url = content.getUrl({
        book: {
          contentVersion: '1.0',
          uuid: longID,
        },
        page: {
          uuid: longID,
        }});
      expect(url).toEqual('/books/longidin-vali-dfor-mat1-111111111111@1.0/pages/longidin-vali-dfor-mat1-111111111111');
    });
  });

  describe('route renders', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      resetModules();
      ({React, renderer} = reactAndFriends());
      content = require('./routes').content;
      createApp = require('../index').default;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('renders a component', () => {
      const store = createTestStore();
      const services = {
        ...createTestServices(),
        dispatch: store.dispatch,
        getState: store.getState,
      };

      const params = {
        book: {
          slug: mockCmsBook.meta.slug,
        },
        page: {
          slug: 'test-page-1',
        },
      };
      const state = {
        bookUid: book.id,
        bookVersion: book.version,
        pageUid: page.id,
      };

      const match: Match<typeof content> = {
        params,
        route: content,
        state,
      };
      const app = createApp({
        initialEntries: [match],
        services,
      });

      const tree = renderer.create(<app.container />);

      expect(tree.toJSON()).toMatchSnapshot();

      tree.unmount();
    });
  });

  describe('route content', () => {
    const mockBookConfig = {
      [book.id]: {defaultVersion: book.version},
    } as {[key: string]: {defaultVersion: string}};

    it('doesnt set archive url on getSearch when there is only a default archive url', () => {
      resetModules();
      jest.doMock('../../config', () => ({REACT_APP_ARCHIVE_URL: 'some-content'}));
      jest.doMock('../../config.books', () => mockBookConfig);
      expect(require('./routes').content.getSearch()).toEqual('');
    });

    it('sets archive url on getSearch when there is an archive url override and no default', () => {
      resetModules();
      jest.doMock('../../config', () => ({REACT_APP_ARCHIVE_URL_OVERRIDE: 'some-content'}));
      jest.doMock('../../config.books', () => mockBookConfig);
      expect(require('./routes').content.getSearch()).toEqual('archive=some-content');
    });

    it('sets archive url on getSearch when there is an archive url override and a default', () => {
      resetModules();
      jest.doMock('../../config', () => ({
        REACT_APP_ARCHIVE_URL: 'asdf',
        REACT_APP_ARCHIVE_URL_OVERRIDE: 'some-content',
      }));
      jest.doMock('../../config.books', () => mockBookConfig);
      expect(require('./routes').content.getSearch()).toEqual('archive=some-content');
    });
  });
});

describe('assigned route', () => {
  let assigned: any;
  let React: any;
  let renderer: any;
  let createApp: any;

  it('renders url', () => {
    assigned = require('./routes').assigned;
    const url = assigned.getUrl({activityId: 'coolid'});
    expect(url).toEqual('/apps/rex/assigned/coolid');
  });

  describe('route renders', () => {
    let preloadAll: any;
    let services: AppServices;
    let app: any;
    let match: Match<typeof assigned>;

    beforeEach(() => {
      resetModules();
      ({React, renderer} = reactAndFriends());
      preloadAll = require('react-loadable').preloadAll;
      assigned = require('./routes').assigned;
      createApp = require('../index').default;
      services = createTestServices();

      jest.spyOn(services.highlightClient, 'getHighlights').mockReturnValue(
        Promise.resolve({
          data: [],
          meta: {count: 0, page: 1, perPage: 200, totalCount: 0},
        })
      );

      const params = {activityId: book.id};
      match = {params, route: assigned, state: {}};
      app = createApp({services});
    });

    it('renders loading state (for loadable component)', async() => {
      app.store.dispatch(locationChange({
        action: 'PUSH',
        location: {
          hash: '',
          pathname: '/apps/rex/assigned/123456',
          search: `?book=${book.id}&section=${page.id}`,
          state: {},
        },
        match,
      }));

      const tree = renderer.create(<app.container />);

      expect(tree.toJSON()).toMatchSnapshot();

      tree.unmount();
    });

    it('renders a component', async() => {
      await preloadAll();

      app.store.dispatch(locationChange({
        action: 'PUSH',
        location: {
          hash: '',
          pathname: '/apps/rex/assigned/123456',
          search: `?book=${book.id}&section=${page.id}`,
          state: {},
        },
        match,
      }));

      const tree = renderer.create(<app.container />);

      await renderer.act(async() => {
        await app.services.promiseCollector.calm();
      });

      expect(tree.toJSON()).toMatchSnapshot();

      tree.unmount();
    });
  });

  describe('getSearch', () => {
    const mockBookConfig = {
      [book.id]: {defaultVersion: book.version},
    } as {[key: string]: {defaultVersion: string}};

    it('doesnt set archive url on getSearch when there is only a default archive url', () => {
      resetModules();
      jest.doMock('../../config', () => ({REACT_APP_ARCHIVE_URL: 'some-content'}));
      jest.doMock('../../config.books', () => mockBookConfig);
      expect(require('./routes').assigned.getSearch()).toEqual('');
    });

    it('sets archive url on getSearch when there is an archive url override and no default', () => {
      resetModules();
      jest.doMock('../../config', () => ({REACT_APP_ARCHIVE_URL_OVERRIDE: 'some-content'}));
      jest.doMock('../../config.books', () => mockBookConfig);
      expect(require('./routes').assigned.getSearch()).toEqual('archive=some-content');
    });

    it('sets archive url on getSearch when there is an archive url override and a default', () => {
      resetModules();
      jest.doMock('../../config', () => ({
        REACT_APP_ARCHIVE_URL: 'asdf',
        REACT_APP_ARCHIVE_URL_OVERRIDE: 'some-content',
      }));
      jest.doMock('../../config.books', () => mockBookConfig);
      expect(require('./routes').assigned.getSearch()).toEqual('archive=some-content');
    });
  });
});
