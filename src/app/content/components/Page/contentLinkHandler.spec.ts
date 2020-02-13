import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { assertDocument } from '../../../utils';
import * as routes from '../../routes';
import { formatBookData } from '../../utils';
import { contentLinkHandler, ContentLinkProp } from './contentLinkHandler';

const book = {
  ...formatBookData(archiveBook, mockCmsBook),
  id: 'longidin-vali-dfor-mat1-111111111111',
};

describe('contentLinkHandler', () => {
  let handler: ReturnType<typeof contentLinkHandler>;
  let prop: ContentLinkProp;
  let anchor: HTMLAnchorElement;

  beforeEach(() => {
    anchor = assertDocument().createElement('a');

    prop = {
      book,
      currentPath: '/asdf',
      hasUnsavedHighlight: false,
      locationState: {} as any,
      navigate: jest.fn(),
      page,
      references: [],
    };

    handler = contentLinkHandler(anchor, () => prop);
  });

  it('intercepts clicking content links with uuid', async() => {
    const link = `/books/${book.id}@${book.version}/pages/page-title`;
    anchor.setAttribute('href', link);
    prop.references = [{
      match: link,
      params: {
        page: 'page-title',
        uuid: book.id,
        version: book.version,
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
        page: 'page-title',
        uuid: book.id,
        version: book.version,
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
        book: book.slug,
        page: 'page-title',
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
        book: book.slug,
        page: 'page-title',
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
