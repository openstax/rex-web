import { HTMLAnchorElement, MouseEvent } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { AppServices, MiddlewareAPI, Store } from '../../../types';
import { assertDocument } from '../../../utils';
import * as routes from '../../routes';
import { formatBookData } from '../../utils';
import { ContentLinkProp, reduceReferences } from './contentLinkHandler';

const book = formatBookData({
  ...archiveBook,
  id: 'longidin-vali-dfor-mat1-111111111111',
  loadOptions: {
    ...archiveBook.loadOptions,
    booksConfig: {
      ...archiveBook.loadOptions.booksConfig,
      books: {
        'longidin-vali-dfor-mat1-111111111111': {defaultVersion: archiveBook.contentVersion},
      },
    },
  },
  tree: {
    ...archiveBook.tree,
    id: 'longidin-vali-dfor-mat1-111111111111@',
  },
}, mockCmsBook);

describe('contentLinkHandler', () => {
  let handler: (e: MouseEvent) => Promise<void>;
  let prop: ContentLinkProp;
  let anchor: HTMLAnchorElement;
  let services: AppServices & MiddlewareAPI;
  let store: Store;

  beforeEach(() => {
    resetModules();
    anchor = assertDocument().createElement('a');
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    prop = {
      book,
      currentPath: '/asdf',
      focusedHighlight: '',
      hasUnsavedHighlight: false,
      navigate: jest.fn(),
      page,
      persistentQueryParams: {},
      references: [],
      systemQueryParams: {},
    };
  });

  describe('reduce references', () => {
    it('noops if the href is not found', async() => {
      const link1 = '#foo';
      const link2 = '#bar';
      const document = assertDocument();
      const linkElem = document.createElement('link');
      const anchorElem = document.createElement('a');
      linkElem.setAttribute('url', link1);
      anchorElem.setAttribute('href', link2);
      document.body.append(linkElem);
      document.body.append(anchorElem);

      prop.references = [{
        match: link1,
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: 'page-title',
          },
        },
      },
      {
        match: link2,
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: 'page-title',
          },
        },
      }];

      reduceReferences(document, prop);
      expect(document.body.innerHTML).toMatchInlineSnapshot(
        `"<link url=\\"#foo\\"><a href=\\"books/book-slug-1/pages/page-title#bar\\"></a>"`
      );
    });
  });

  describe('without unsaved highlight', () => {
    let contentRoute: typeof routes['content'];

    beforeEach(() => {
      contentRoute = require('../../routes').content;
      handler = require('./contentLinkHandler').contentLinkHandler(anchor, () => prop, services);
    });

    it('intercepts clicking content links with uuid', async() => {
      const link = `/books/${book.id}@${book.contentVersion}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            contentVersion: book.contentVersion,
            uuid: book.id,
          },
          page: {
            slug: 'page-title',
          },
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
            contentVersion: book.contentVersion,
            uuid: book.id,
          },
          page: {
            slug: 'page-title',
          },
        },
        route: contentRoute,
        state: {},
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
      }];

      const event = {
        preventDefault: jest.fn(),
      };

      await handler(event as any);

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
        route: contentRoute,
        state: {},
      }, expect.anything());
    });

    it('intercepts clicking content links with book and page uuid', async() => {
      const pageId = book.id;
      const link = `/books/${book.id}@${book.contentVersion}/pages/${pageId}`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            contentVersion: book.contentVersion,
            uuid: book.id,
          },
          page: {
            uuid: pageId,
          },
        },
      }];

      const event = {
        preventDefault: jest.fn(),
      };

      await handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).toHaveBeenCalledWith({
        params: {
          book: {
            contentVersion: book.contentVersion,
            uuid: book.id,
          },
          page: {
            uuid: pageId,
          },
        },
        route: contentRoute,
        state: {},
      }, expect.anything());
    });

    it('intercepts clicking content links that failed to load due to reference loading error', async() => {
      const link = `/books/${book.slug}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        type: 'error',
      }];

      const event = {
        preventDefault: jest.fn(),
      };

      await handler(event as any);

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).not.toHaveBeenCalled();
    });

    it('requires two clicks for links with highlights', async() => {
      const testHighlightID = 'randomid';

      const highlight = assertDocument().createElement('span');
      highlight.setAttribute('data-highlight-id', testHighlightID);

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
      }];

      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: highlight,
      };

      await handler(event as any);

      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).not.toHaveBeenCalled();

      prop.focusedHighlight = testHighlightID;
      event.preventDefault.mockClear();

      await handler(event as any);

      expect(event.stopPropagation).toHaveBeenCalled();
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
        route: contentRoute,
        state: {},
      }, expect.anything());
    });
  });

  describe('with unsaved highlight', () => {
    let event: any;
    const mockConfirmation = jest.fn();

    jest.mock(
      '../../highlights/components/utils/showConfirmation',
      () => mockConfirmation
    );

    beforeEach(() => {
      prop.hasUnsavedHighlight = true;

      handler = require('./contentLinkHandler').contentLinkHandler(anchor, () => prop, services);

      const link = `/books/${book.id}@${book.contentVersion}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            contentVersion: book.contentVersion,
            uuid: book.id,
          },
          page: {
            slug: 'page-title',
          },
        },
      }];

      event = {
        preventDefault: jest.fn(),
      };
    });

    it('noops if user chooses not to discard', async() => {
      mockConfirmation.mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(false), 300)));
      await handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockConfirmation).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).not.toHaveBeenCalled();
    });

    it('intercepts clicking if user chooses to discard', async() => {
      mockConfirmation.mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(true), 300)));
      await handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockConfirmation).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).toHaveBeenCalled();
    });
  });
});
