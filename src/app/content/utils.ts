import { OSWebBook } from '../../helpers/createOSWebLoader';
import { ArchiveBook, Book } from './types';
import { getIdVersion, stripIdVersion } from './utils/idUtils';

export * from './utils/idUtils';
export * from './utils/archiveTreeUtils';
export * from './utils/urlUtils';
export * from './utils/domUtils';

export const getContentPageReferences = (content: string) =>
  (content.match(/\/contents\/([a-z0-9\-]+(@[\d\.]+)?)(:([a-z0-9\-]+(@[\d\.]+)?))?/g) || [])
    .map((match) => {
      const id = match.substr(10);
      const bookId = id.indexOf(':') > -1 && id.split(':')[0];
      const pageId = id.indexOf(':') > -1 ? id.split(':')[1] : id;

      return {
        bookUid: bookId ? stripIdVersion(bookId) : undefined,
        bookVersion: bookId ? getIdVersion(bookId) : undefined,
        match,
        pageUid: stripIdVersion(pageId),
      };
    });

export const formatBookData = (archiveBook: ArchiveBook, osWebBook: OSWebBook): Book => ({
  ...archiveBook,
  authors: osWebBook.authors,
  publish_date: osWebBook.publish_date,
  slug: osWebBook.meta.slug,
});
