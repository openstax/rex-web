import createTestServices from '../../test/createTestServices';
import { book, page } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../test/utils';
import { Match } from '../navigation/types';

describe('content route', () => {
  let content: any;
  let React: any; // tslint:disable-line:variable-name
  let renderer: any;
  let createApp: any;

  it('generates a url', () => {
    content = require('./routes').content;
    const url = content.getUrl({slug: 'book', page: 'page'});
    expect(url).toEqual('/books/book/pages/page');
  });

  it('generates a versioned url', () => {
    content = require('./routes').content;
    const url = content.getUrl({slug: 'book', page: 'page', version: 'asdf'});
    expect(url).toEqual('/books/book@asdf/pages/page');
  });

  it('generates a url with uuid', () => {
    content = require('./routes').content;
    const url = content.getUrl({uuid: 'longidin-vali-dfor-mat1-111111111111', page: 'page', version: '1.0'});
    expect(url).toEqual('/books/longidin-vali-dfor-mat1-111111111111@1.0/pages/page');
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
        page: 'test-page-1',
        slug: mockCmsBook.meta.slug,
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

      const tree = renderer
          .create(<app.container />)
          .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
