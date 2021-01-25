import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { argv } from 'yargs';
import { LinkedArchiveTreeNode } from '../src/app/content/types';
import { flattenArchiveTree } from '../src/app/content/utils';
import archivedSlugs from '../src/archived-slugs.json';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import books from '../src/config.books.json';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

interface ArchivedSlug {
  pathname: string;
  bookId: string;
  pageId: string;
}

type ArchivedSlugs = ArchivedSlug[];

const { book, newVersion } = argv as any as {
  book: string
  newVersion: string | number;
};

(global as any).fetch = fetch;

const booksPath = path.resolve(__dirname, '../src/config.books.json');
const archivedSlugsPath = path.resolve(__dirname, '../src/archived-slugs.json');

const archiveLoader = createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`);
const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

async function processBooks() {
  const booksData = Object.entries(books);
  const bookToUpdateIndex = booksData.findIndex(([id]) => id === book);
  const bookToUpdate = booksData[bookToUpdateIndex] as [string, { defaultVersion: string }] | undefined;

  if (!bookToUpdate) {
    console.error(`book ${book} not found`); // tslint:disable-line:no-console
    return;
  }

  const [bookId, { defaultVersion }] = bookToUpdate;

  const { title, tree: currentTree } = await archiveLoader.book(bookId, defaultVersion).load()
    .catch(() => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with defaultVersion ${defaultVersion}`);
      process.exit();
    });
  const { tree: newTree } = await archiveLoader.book(bookId, newVersion.toString()).load()
    .catch(() => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with newVersion ${newVersion}`);
      process.exit();
    });
  const bookSlug = await osWebLoader.getBookSlugFromId(bookId)
    .catch(() => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading slug for bookId ${bookId}`);
      process.exit();
    });

  const flatCurrentTree = flattenArchiveTree(currentTree);
  const flatNewTree = flattenArchiveTree(newTree);
  const missingPages = [...archivedSlugs] as ArchivedSlugs;

  const findArchivedSlug = (section: LinkedArchiveTreeNode) => (
    { pageId, bookId: pageBookId, pathname }: ArchivedSlug
  ) => pageId === section.id && pageBookId === bookId && pathname.split('/').pop() === section.slug;

  const formatSection = (section: LinkedArchiveTreeNode) => ({
    bookId,
    pageId: section.id,
    pathname: `/books/${bookSlug}/pages/${section.slug}`,
  });

  let countNewArchivedSlugs = 0;
  for (const section of flatCurrentTree) {
    if (
      !flatNewTree.find((newSection) => newSection.slug === section.slug)
      && !archivedSlugs.find(findArchivedSlug(section))
    ) {
      missingPages.push(formatSection(section));
      countNewArchivedSlugs++;
    }
  }

  fs.writeFileSync(archivedSlugsPath, JSON.stringify(missingPages, undefined, 2), 'utf8');

  booksData[bookToUpdateIndex] = [bookId, { defaultVersion: newVersion.toString() }];
  const newBooksData: { [key: string]: { defaultVersion: string } } = {};
  booksData.forEach(([id, data]) => newBooksData[id] = data);

  fs.writeFileSync(booksPath, JSON.stringify(newBooksData, undefined, 2), 'utf8');

  // tslint:disable-next-line: no-console
  console.log(`updated ${title} and added ${countNewArchivedSlugs} new archived slugs`);
}

processBooks();
