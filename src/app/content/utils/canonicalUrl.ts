import { isEqual } from 'lodash/fp';
import { CANONICAL_MAP, ObjectLiteral } from '../../../canonicalBookMap';
import { getBookVersionFromUUIDSync } from '../../../gateways/createBookConfigLoader';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { hasOSWebData } from '../guards';
import { Book, BookWithOSWebData } from '../types';
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

  const getCanonicalMap = (bookId: string) => {
    const bookDefaultMap = [[bookId, {}]] as Array<[string, ObjectLiteral<undefined>]>;
    const bookVersionFromConfig = getBookVersionFromUUIDSync(bookId);
    return ([
      ...(CANONICAL_MAP[bookId] || []),
      ...(bookVersionFromConfig && bookVersion === bookVersionFromConfig.defaultVersion ? bookDefaultMap : []),
      // use the current book as a last resort if it has the same version as in books config
    ]).filter(([id]) => !!getBookVersionFromUUIDSync(id));
};

  let canonicalMap = getCanonicalMap(book.id);
  let canonicalBook;
  let canonicalPageId = pageId;
  let done = false;
  let treeSection;

  while (!done) {
    for (const [id, CANONICAL_PAGES_MAP] of canonicalMap) {
      const version = assertDefined(
        getBookVersionFromUUIDSync(id),
        `We've already filtered out books that are not in the BOOK configuration`
      ).defaultVersion;
      const useCurrentBookAsCanonical = book.id === id  && hasOSWebData(book);
      canonicalBook = useCurrentBookAsCanonical ? book : await getBook(id, version);
      canonicalPageId = CANONICAL_PAGES_MAP[canonicalPageId] || canonicalPageId;
      treeSection = findArchiveTreeNodeById(canonicalBook.tree, canonicalPageId);

      if (!useCurrentBookAsCanonical) {
        const newMap = getCanonicalMap(canonicalBook.id);
        // stop when we run out of canonical maps to check
        done = !newMap.length || isEqual(canonicalMap, newMap);
        canonicalMap = newMap;
        break;
      }
      done = true;
    }
  }

  if (treeSection) {
    const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
    return {book: {slug: (canonicalBook as BookWithOSWebData).slug}, page: {slug: pageInBook}};
  }

  return null;
}
