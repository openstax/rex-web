import createTestServices from '../../test/createTestServices';
import { book, page } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../test/utils';
import { Match } from '../navigation/types';

const longID = 'longidin-vali-dfor-mat1-111111111111';

describe('content route', () => {
  let content: any;
  let React: any; // tslint:disable-line:variable-name
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
      const url = content.getUrl({book: {slug: 'book', version: 'asdf'}, page: {slug: 'page'}});
      expect(url).toEqual('/books/book@asdf/pages/page');
    });

    it('for book uuid with version and page slug', () => {
      content = require('./routes').content;
      const url = content.getUrl({
        book: {
          uuid: longID,
          version: '1.0',
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
      const url = content.getUrl({book: {slug: 'book', version: 'asdf'}, page: {uuid: longID}});
      expect(url).toEqual('/books/book@asdf/pages/longidin-vali-dfor-mat1-111111111111');
    });

    it('for book uuid with version and page uuid', () => {
      content = require('./routes').content;
      const url = content.getUrl({
        book: {
          uuid: longID,
          version: '1.0',
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
      const services = createTestServices();

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
