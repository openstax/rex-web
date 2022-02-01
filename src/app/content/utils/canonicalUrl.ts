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
  const bookDefaultMap = [[book.id, {}]] as Array<[string, ObjectLiteral<undefined>]>;
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader);
  const bookVersionFromConfig = getBookVersionFromUUIDSync(book.id);
  const canonicals = ([
    ...(CANONICAL_MAP[book.id] || []),
    ...(bookVersionFromConfig && bookVersion === bookVersionFromConfig.defaultVersion ? bookDefaultMap : []),
    // use the current book as a last resort if it has the same version as in books config
  ]).filter(([id]) => !!getBookVersionFromUUIDSync(id));

  for (const [id, CANONICAL_PAGES_MAP] of canonicals) {
    const version = assertDefined(
      getBookVersionFromUUIDSync(id),
      `We've already filtered out books that are not in the BOOK configuration`
    ).defaultVersion;
    const canonicalBook = book.id === id  && hasOSWebData(book) ? book : await getBook(id, version);
    const mappedPageId = CANONICAL_PAGES_MAP[pageId] || pageId;
    const treeSection = findArchiveTreeNodeById(canonicalBook.tree, mappedPageId);

    if (treeSection) {
      const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
      return {book: {slug: canonicalBook.slug}, page: {slug: pageInBook}};
    }
  }

  return null;
}
