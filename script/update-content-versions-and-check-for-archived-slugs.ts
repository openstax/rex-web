import fs from 'fs';
import path from 'path';
import { argv } from 'yargs';
import { content } from '../src/app/content/routes';
import { LinkedArchiveTreeNode } from '../src/app/content/types';
import { flattenArchiveTree } from '../src/app/content/utils';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { findArchiveTreeNodeById } from '../src/app/content/utils/archiveTreeUtils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import books from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import redirects from '../src/redirects';

interface Redirect {
  pathname: string;
  bookId: string;
  pageId: string;
}

const { bookId, newVersion } = argv as any as {
  bookId: string
  newVersion: string | number;
};

const booksPath = path.resolve(__dirname, '../src/config.books.json');
const redirectsPath = path.resolve(__dirname, '../src/redirects.json');

const bookLoader = makeUnifiedBookLoader(
  createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`),
  createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`)
);

async function updateRedirections(_bookId: string, currentVersion: string, _newVersion: string) {
  if (currentVersion === _newVersion) {
    return 0;
  }

  const { tree: currentTree, slug: bookSlug } = await bookLoader(_bookId, currentVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${_bookId} with defaultVersion ${currentVersion}`);
      throw error;
    });

  const { tree: newTree } = await bookLoader(_bookId, _newVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${_bookId} with newVersion ${_newVersion}`);
      throw error;
    });

  const flatCurrentTree = flattenArchiveTree(currentTree);

  const findRedirect = (section: LinkedArchiveTreeNode) => (
    { pageId, bookId: pageBookId, pathname }: Redirect
  ) => pageId === section.id && pageBookId === _bookId && pathname.split('/').pop() === section.slug;

  const formatSection = (section: LinkedArchiveTreeNode) => ({
    bookId: _bookId,
    pageId: section.id,
    pathname: content.getUrl({ book: { slug: bookSlug }, page: { slug: section.slug } }),
  });

  let countNewRedirections = 0;
  for (const section of flatCurrentTree) {
    const { slug } = findArchiveTreeNodeById(newTree, section.id) || {};
    if (
      (slug && slug !== section.slug)
      && !redirects.find(findRedirect(section))
    ) {
      redirects.push(formatSection(section));
      countNewRedirections++;
    }
  }

  fs.writeFileSync(redirectsPath, JSON.stringify(redirects, undefined, 2), 'utf8');

  return countNewRedirections;
}

async function processBook() {
  const { defaultVersion } = books[bookId] || {};

  if (defaultVersion === newVersion.toString()) {
    console.log(`${bookId} alredy at desired version.`); // tslint:disable-line:no-console
    process.exit(0);
  }

  const { title, version } = await bookLoader(bookId, newVersion.toString())
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with version ${newVersion}`);
      throw error;
    });

  books[bookId] = { defaultVersion: version };

  fs.writeFileSync(booksPath, JSON.stringify(books, undefined, 2) + '\n', 'utf8');

  const newRedirectionsCounter = await updateRedirections(bookId, defaultVersion, newVersion.toString());

  // tslint:disable-next-line: no-console
  console.log(`updated ${title} and added ${newRedirectionsCounter} new redirections`);
}

processBook();
