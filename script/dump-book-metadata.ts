import fetch from 'node-fetch';
import { Book, LinkedArchiveTree, LinkedArchiveTreeSection } from '../src/app/content/types';
import { formatBookData } from '../src/app/content/utils';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { getPageDescription, getParentPrefix } from '../src/app/content/utils/seoUtils';
import createIntl from '../src/app/messages/createIntl';
import { ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import { getBooksConfigSync } from '../src/gateways/createBookConfigLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

(global as any).fetch = fetch;
const domParser = new DOMParser();

const booksConfig = getBooksConfigSync();
const archiveLoader = createArchiveLoader({
  archivePrefix: ARCHIVE_URL,
});
const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

const getPageMetadata = async(
  section: LinkedArchiveTreeSection | LinkedArchiveTree,
  book: Book,
  loader: ReturnType<(typeof archiveLoader)['book']>
) => {
  const intl = await createIntl(book.language);
  const services = {
    archiveLoader,
  };
  const page = await loader.page(section.id).load();
  const description = getPageDescription(services, intl, book, page);
  const sectionTitle = domParser.parseFromString(section.title, 'text/html').body.textContent;
  const parentPrefix = getParentPrefix(section.parent, intl).trim();

  const row = `"${book.title}","${parentPrefix}","${sectionTitle}","${description}"`;
  console.log(row);
};

const getBookMetadata = async(id: string) => {
  const loader = archiveLoader.book(id, {booksConfig});
  const singleBook = await loader.load();
  const osWebBook = singleBook.tree.slug ? await osWebLoader.getBookFromSlug(singleBook.tree.slug) : undefined;
  const book = formatBookData(singleBook, osWebBook);
  const bookPages = findTreePages(book.tree);

  const bookRows = await Promise.all(bookPages.map(async(page) => getPageMetadata(page, book, loader)));

  return bookRows;
};

const getAllBooksMetadata = async() => {
  for (const [bookId] of Object.entries(booksConfig.books)) {
    await getBookMetadata(bookId);
  }
};

getAllBooksMetadata();
