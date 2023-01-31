import { isEqual } from 'lodash/fp';
import { CANONICAL_MAP, ObjectLiteral } from '../../../canonicalBookMap';
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
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader, book.loadOptions);

  const getCanonicalMap = (bookId: string) => {
    const bookDefaultMap = [[bookId, {}]] as Array<[string, ObjectLiteral<undefined>]>;
    return ([
      ...(CANONICAL_MAP[bookId] || bookDefaultMap),
      // use the current book if no map is found
    ]).filter(([id]) => !!book.loadOptions.booksConfig.books[id]);
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
      const useCurrentBookAsCanonical = book.id === id && hasOSWebData(book);
      canonicalBook = useCurrentBookAsCanonical ? book : await getBook(id);
      canonicalPageId = CANONICAL_PAGES_MAP[canonicalPageId] || canonicalPageId;
      const treeSection = findArchiveTreeNodeById(canonicalBook.tree, canonicalPageId);

      // use the last canonical page found if none is found in current canonical book
      if (!treeSection && canonicalBookWithPage) {
        done = true;
        break;
      } else if (treeSection) {
        canonicalBookWithPage = {canonicalBook, treeSection};
      }

      // check if canonical book maps to another book not yet checked
      const newMap = getCanonicalMap(canonicalBook.id);
      done = !newMap.length || !!mapsChecked.find((map) => isEqual(map, newMap));
      canonicalMap = newMap;
    }
  }

  // use current page as canonical if page not found in canonical book
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
