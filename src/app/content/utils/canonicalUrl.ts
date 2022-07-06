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
  let canonicalBookWithPage;

  while (canonicalMap.length && !done) {
    for (const [id, CANONICAL_PAGES_MAP] of canonicalMap) {
      mapsChecked.push(canonicalMap);
      const version = assertDefined(
        getBookVersionFromUUIDSync(id),
        `We've already filtered out books that are not in the BOOK configuration`
      ).defaultVersion;
      canonicalBook = book.id === id  && hasOSWebData(book) ? book : await getBook(id, version);
      canonicalPageId = CANONICAL_PAGES_MAP[canonicalPageId] || canonicalPageId;
      const treeSection = findArchiveTreeNodeById(canonicalBook.tree, canonicalPageId);
      if (!treeSection && canonicalBookWithPage) {
        done = true;
        break;
      } else if (treeSection) {
        canonicalBookWithPage = {canonicalBook, treeSection};
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

  // use current page if no canonical was found
  if (!canonicalBookWithPage && canonicalMap.length) {
    const treeSection = findArchiveTreeNodeById(book.tree, pageId);
    canonicalBookWithPage = {canonicalBook: book, treeSection};
  }
  if (canonicalBookWithPage && canonicalBookWithPage.treeSection) {
    const pageInBook = assertDefined(canonicalBookWithPage.treeSection.slug, 'Expected page to have slug.');
    return {book: {slug: (canonicalBookWithPage.canonicalBook as BookWithOSWebData).slug}, page: {slug: pageInBook}};
  }

  return null;
}
