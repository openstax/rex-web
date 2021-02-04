import fs from 'fs';
import isEqual from 'lodash/fp/isEqual';
import path from 'path';
import { argv } from 'yargs';
import { Redirects } from '../data/redirects/types';
import { content } from '../src/app/content/routes';
import { LinkedArchiveTreeNode } from '../src/app/content/types';
import { flattenArchiveTree } from '../src/app/content/utils';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { findArchiveTreeNodeById } from '../src/app/content/utils/archiveTreeUtils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import books from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

const args = argv as any as {
  bookId: string
  versionNumber: string | number;
};

const booksPath = path.resolve(__dirname, '../src/config.books.json');
const redirectsPath = path.resolve(__dirname, '../data/redirects/');

const bookLoader = makeUnifiedBookLoader(
  createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`),
  createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`)
);

async function updateRedirections(bookId: string, currentVersion: string, newVersion: string) {
  if (currentVersion === newVersion) {
    return 0;
  }

  const { tree: currentTree, slug: bookSlug } = await bookLoader(bookId, currentVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with defaultVersion ${currentVersion}`);
      throw error;
    });

  const { tree: newTree } = await bookLoader(bookId, newVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with newVersion ${newVersion}`);
      throw error;
    });

  const redirectsBookPath = path.resolve(redirectsPath, bookId + '.json');
  const redirects: Redirects = fs.existsSync(redirectsBookPath) ? await import(redirectsBookPath) : [];

  const flatCurrentTree = flattenArchiveTree(currentTree);

  const formatSection = (section: LinkedArchiveTreeNode) => ({
    bookId,
    pageId: section.id,
    pathname: content.getUrl({ book: { slug: bookSlug }, page: { slug: section.slug } }),
  });

  const matchRedirect = (section: LinkedArchiveTreeNode) => isEqual(formatSection(section));

  let countNewRedirections = 0;
  for (const section of flatCurrentTree) {
    const { slug } = findArchiveTreeNodeById(newTree, section.id) || {};
    if (
      (slug && slug !== section.slug)
      && !redirects.find(matchRedirect(section))
    ) {
      redirects.push(formatSection(section));
      countNewRedirections++;
    }
  }

  fs.writeFileSync(redirectsBookPath, JSON.stringify(redirects, undefined, 2) + '\n', 'utf8');

  return countNewRedirections;
}

async function processBook() {
  const { defaultVersion } = books[args.bookId] || {};
  const newVersion = args.versionNumber.toString();

  if (defaultVersion === newVersion) {
    // tslint:disable-next-line: no-console
    console.log(`${args.bookId} alredy at desired version.`);
    process.exit(0);
  }

  const { title, version } = await bookLoader(args.bookId, newVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${args.bookId} with version ${newVersion}`);
      throw error;
    });

  const updatedBooksConfig = { ...books };
  updatedBooksConfig[args.bookId] = { defaultVersion: version };

  fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');

  // defaultVersion will be undefined when we add a new book.
  // In this case we don't need to updateRedirections because there is nothing to update.
  const newRedirectionsCounter = defaultVersion
    ? await updateRedirections(args.bookId, defaultVersion, newVersion)
    : 0;

  // tslint:disable-next-line: no-console
  console.log(`updated ${title} and added ${newRedirectionsCounter} new redirections`);
}

processBook();
