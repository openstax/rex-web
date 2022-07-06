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
  pageId: string
) {
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const getCanonicalMap = (bookId: string) => {
    const bookDefaultMap = [[bookId, {}]] as Array<[string, ObjectLiteral<undefined>]>;
    return ([
      ...(CANONICAL_MAP[bookId] || bookDefaultMap),
      // use the current book if no map is found
    ]).filter(([id]) => !!getBookVersionFromUUIDSync(id));
};

  let canonicalMap = getCanonicalMap(book.id);
  const mapsChecked = [];
  let canonicalPageId = pageId;
  let done = false;
  let canonicalBook;
  let treeSection;

  while (canonicalMap.length && !done) {
    for (const [id, CANONICAL_PAGES_MAP] of canonicalMap) {
      mapsChecked.push(canonicalMap);
      const version = assertDefined(
        getBookVersionFromUUIDSync(id),
        `We've already filtered out books that are not in the BOOK configuration`
      ).defaultVersion;
      canonicalBook = book.id === id  && hasOSWebData(book) ? book : await getBook(id, version);
      canonicalPageId = CANONICAL_PAGES_MAP[canonicalPageId] || canonicalPageId;
      treeSection = findArchiveTreeNodeById(canonicalBook.tree, canonicalPageId);

      // end loop if page found and no page map exists for canonical book
      if (treeSection && !CANONICAL_MAP[canonicalBook.id]) {
        done = true;
        break;
      }

      // use canonical book's map
      const newMap = getCanonicalMap(canonicalBook.id);
      done = !newMap.length || isEqual(canonicalMap, newMap);
      // throw if the new map has already been checked
      if (!done && mapsChecked.find((map) => isEqual(map, newMap))) {
        throw new Error(`Loop encountered in map for ${canonicalBook.id}`);
      }
      canonicalMap = newMap;
    }
  }

  // use current page if page not found in canonical book
  if (!treeSection && canonicalMap.length) {
    treeSection = findArchiveTreeNodeById(book.tree, pageId);
    canonicalBook = book;
  }
  if (treeSection) {
    const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
    return {book: {slug: (canonicalBook as BookWithOSWebData).slug}, page: {slug: pageInBook}};
  }

  return null;
}
