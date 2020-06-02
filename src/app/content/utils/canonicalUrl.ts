import { CANONICAL_MAP } from '../../../canonicalBookMap';
import { BOOKS } from '../../../config';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { hasOSWebData } from '../guards';
import { Book } from '../types';
import { makeUnifiedBookLoader } from '../utils';
import { findArchiveTreeNode } from './archiveTreeUtils';

export async function getCanonicalUrlParams(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  book: Book,
  pageId: string,
  bookVersion?: string
) {
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader);
  console.log('pageId', pageId)
  console.log('CANONICAL_MAP[book.id]', CANONICAL_MAP[book.id])
  console.log('BOOKS[book.id]', BOOKS[book.id])
  console.log('bookVersion', bookVersion)
  console.log('BOOKS[book.id].defaultVersion', BOOKS[book.id] ? BOOKS[book.id].defaultVersion : null)
  const canonicals = ([
    ...(CANONICAL_MAP[book.id] || []),
    ...(BOOKS[book.id] && bookVersion === BOOKS[book.id].defaultVersion ? [[book.id, {}]] : []),
    // use the current book as a last resort if it has the same version as in books config
  ] as any as Array<[string, { [key: string]: string}]>).filter(([id]) => !!BOOKS[id]);
  console.log('canonicals', canonicals)
  for (const [id, CANONICAL_PAGES_MAP] of canonicals) {
    const version = BOOKS[id].defaultVersion;
    console.log('version', version)
    const canonicalBook = book.id === id  && hasOSWebData(book) ? book : await getBook(id, version);
    console.log('canonicalBook', canonicalBook)
    const mappedPageId = CANONICAL_PAGES_MAP[pageId] || pageId;
    console.log('mappedPageId', mappedPageId)
    const treeSection = findArchiveTreeNode(canonicalBook.tree, pageId);
    console.log('treeSection', treeSection)

    if (treeSection) {
      const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
      console.log('res', {book: {slug: canonicalBook.slug}, page: {slug: pageInBook}})
      return {book: {slug: canonicalBook.slug}, page: {slug: pageInBook}};
    }
  }

  return null;
}
