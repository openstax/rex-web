import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { assertDocument } from '../../../utils';
import * as routes from '../../routes';
import { formatBookData } from '../../utils';
import { contentLinkHandler, ContentLinkProp } from './contentLinkHandler';
import { resetModules } from '../../../../test/utils';
import { REACT_APP_ARCHIVE_URL, APP_ENV } from '../../../../config';

const book = {
  ...formatBookData(archiveBook, mockCmsBook),
  id: 'longidin-vali-dfor-mat1-111111111111',
};

const mockConfig = {BOOKS: {
  [book.id]: {defaultVersion: book.version},
 } as {[key: string]: {defaultVersion: string}}};

describe('contentLinkHandler', () => {
  let handler: ReturnType<typeof contentLinkHandler>;
  let prop: ContentLinkProp;
  let anchor: HTMLAnchorElement;

  beforeEach(() => {
    resetModules();
    anchor = assertDocument().createElement('a');

    prop = {
      book,
      currentPath: '/asdf',
      locationState: {} as any,
      navigate: jest.fn(),
      page,
      references: [],
    };

    handler = contentLinkHandler(anchor, () => prop);
  });

  beforeAll(() => {
    jest.doMock('../../../../config', () => ({...mockConfig, REACT_APP_ARCHIVE_URL: 'some-content'}));
    console.log(REACT_APP_ARCHIVE_URL);
  });

  it('intercepts clicking content links with uuid', async() => {
    const link = `/books/${book.id}@${book.version}/pages/page-title`;
    anchor.setAttribute('href', link);
    prop.references = [{
      match: link,
      params: {
        book: {
          uuid: book.id,
          version: book.version,
        },
        page: {
          slug: 'page-title',
        },
      },
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }];

    const event = {
      preventDefault: jest.fn(),
    };

    handler(event as any);

    expect(event.preventDefault).toHaveBeenCalled();

    await new Promise((resolve) => defer(resolve));

    expect(prop.navigate).toHaveBeenCalledWith({
      params: {
        book: {
          uuid: book.id,
          version: book.version,
        },
        page: {
          slug: 'page-title',
        },
      },
      route: routes.content,
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }, expect.anything());
  });

  it('intercepts clicking content links with slug', async() => {
    const link = `/books/${book.slug}/pages/page-title`;
    anchor.setAttribute('href', link);
    prop.references = [{
      match: link,
      params: {
        book: {
          slug: book.slug,
        },
        page: {
          slug: 'page-title',
        },
      },
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }];

    const event = {
      preventDefault: jest.fn(),
    };

    handler(event as any);

    expect(event.preventDefault).toHaveBeenCalled();

    await new Promise((resolve) => defer(resolve));

    expect(prop.navigate).toHaveBeenCalledWith({
      params: {
        book: {
          slug: book.slug,
        },
        page: {
          slug: 'page-title',
        },
      },
      route: routes.content,
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }, expect.anything());
  });

  it('intercepts clicking content links with archive', async() => {
    console.log(APP_ENV);
    console.log(REACT_APP_ARCHIVE_URL);

    const link = `/books/${book.slug}/pages/page-title`;
    anchor.setAttribute('href', link);
    prop.references = [{
      match: link,
      params: {
        book: {
          uuid: book.id,
          version: book.version,
        },
        page: {
          slug: 'page-title',
        },
      },
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }];

    const event = {
      preventDefault: jest.fn(),
    };

    handler(event as any);

    expect(event.preventDefault).toHaveBeenCalled();

    await new Promise((resolve) => defer(resolve));

    expect(prop.navigate).toHaveBeenCalledWith({
      params: {
        book: {
          uuid: book.id,
          version: book.version,
        },
        page: {
          slug: 'page-title',
        },
      },
      route: routes.content,
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }, expect.anything());
  });
});
