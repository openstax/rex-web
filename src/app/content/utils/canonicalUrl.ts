import { isEqual } from 'lodash/fp';
import { CANONICAL_MAP, ObjectLiteral } from '../../../canonicalBookMap';
import { getBookVersionFromUUIDSync } from '../../../gateways/createBookConfigLoader';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { hasOSWebData } from '../guards';
import { Book } from '../types';
import { makeUnifiedBookLoader } from '../utils';
import { findArchiveTreeNodeById } from './archiveTreeUtils';

export async function getCanonicalUrlParams(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  book: Book,
  pageId: string,
  bookVersion?: string
) {
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const getCanonicals = (bookId: string) => {
    const bookDefaultMap = [[bookId, {}]] as Array<[string, ObjectLiteral<undefined>]>;
    const bookVersionFromConfig = getBookVersionFromUUIDSync(bookId);
    return ([
      ...(CANONICAL_MAP[bookId] || []),
      ...(bookVersionFromConfig && bookVersion === bookVersionFromConfig.defaultVersion ? bookDefaultMap : []),
      // use the current book as a last resort if it has the same version as in books config
    ]).filter(([id]) => !!getBookVersionFromUUIDSync(id));
};

  let canonicals = getCanonicals(book.id);
  let done = false;
  let mappedPageId;
  let treeSection;
  let canonicalBook;

  while (!done) {
    for (const [id, CANONICAL_PAGES_MAP] of canonicals) {
      const version = assertDefined(
        getBookVersionFromUUIDSync(id),
        `We've already filtered out books that are not in the BOOK configuration`
      ).defaultVersion;
      canonicalBook = book.id === id  && hasOSWebData(book) ? book : await getBook(id, version);
      pageId = mappedPageId || pageId;
      mappedPageId = CANONICAL_PAGES_MAP[pageId] || pageId;
      treeSection = findArchiveTreeNodeById(canonicalBook.tree, mappedPageId);

      if (book.id !== id || !hasOSWebData(book)) {
        const newCanonicals = getCanonicals(canonicalBook.id);
        const canonicalsAreEqual = isEqual(canonicals, newCanonicals);
        if (!newCanonicals.length || canonicalsAreEqual) {
          done = true;
        }
        canonicals = newCanonicals;
        break;
      }

      done = true;
    }
  }

  if (canonicalBook && treeSection) {
    const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
    return {book: {slug: canonicalBook.slug}, page: {slug: pageInBook}};
  }

  return null;
}
