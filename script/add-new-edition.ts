import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import argv from 'yargs';
import { makeUnifiedBookLoader, stripIdVersion } from '../src/app/content/utils';
import {
  archiveTreeSectionIsPage,
  disableArchiveTreeCaching,
  flattenArchiveTree,
} from '../src/app/content/utils/archiveTreeUtils';
import { ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import { getBooksConfigSync } from '../src/gateways/createBookConfigLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import { readFile, writeFile } from '../src/helpers/fileUtils';

(global as any).fetch = fetch;
disableArchiveTreeCaching();

const args = argv
  .string('previousBook')
  .string('newBook')
  .argv as any as {
    previousBook: string;
    newBook: string;
  };

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

const addNewEdition = async() => {
  const { previousBook: previousBookId, newBook: newBookId } = args;

  if (!previousBookId || !newBookId) {
    console.error('Missing required args: --previousBook and --newBook');
    process.exit(1);
  }

  if (previousBookId === newBookId) {
    console.error('--previousBook and --newBook must be different');
    process.exit(1);
  }

  const booksConfig = getBooksConfigSync();

  if (!booksConfig.books[previousBookId]) {
    console.error(`Book with id ${previousBookId} not found in config.`);
    process.exit(1);
  }
  if (!booksConfig.books[newBookId]) {
    console.error(`Book with id ${newBookId} not found in config.`);
    process.exit(1);
  }

  const bookLoader = makeUnifiedBookLoader(
    createArchiveLoader({ archivePrefix: ARCHIVE_URL }),
    createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`),
    { booksConfig }
  );

  console.log('Loading books...');
  const [previousBook, newBook] = await Promise.all([
    bookLoader(previousBookId),
    bookLoader(newBookId),
  ]);

  console.log(`Previous edition: ${previousBook.title} (${previousBookId})`);
  console.log(`New edition:      ${newBook.title} (${newBookId})`);

  const flatPreviousTree = flattenArchiveTree(previousBook.tree)
    .filter((s) => s.id !== previousBook.id);
  const flatPreviousPages = flatPreviousTree.filter(archiveTreeSectionIsPage);

  const flatNewPages = flattenArchiveTree(newBook.tree)
    .filter((s) => s.id !== newBook.id)
    .filter(archiveTreeSectionIsPage);

  const newPagesBySlug = new Map(flatNewPages.map((p) => [p.slug, p]));

  // Borrow the matchSlug pattern from update-redirects-data.ts:
  // for each page in the previous edition, find a matching slug in the new edition.
  // If slugs match but IDs differ, record the mapping.
  const pageMap: Array<{ prevId: string; newId: string; title: string }> = [];

  for (const prevPage of flatPreviousPages) {
    const newPage = newPagesBySlug.get(prevPage.slug);
    if (newPage) {
      const prevId = stripIdVersion(prevPage.id);
      const newId = stripIdVersion(newPage.id);
      if (prevId !== newId) {
        pageMap.push({ prevId, newId, title: stripHtml(prevPage.title) });
      }
    }
  }

  console.log(
    `Found ${pageMap.length} pages with matching slugs but different IDs`
    + ` (out of ${flatPreviousPages.length} total pages).`
  );

  // Build the new entry block (indented to fit inside a `export default { ... }` object)
  const previousTitle = stripHtml(previousBook.title);
  const newTitle = stripHtml(newBook.title);

  let entryBlock = `  /* ${previousTitle} */ '${previousBookId}': [\n`;
  entryBlock += `    /* ${newTitle} */ ['${newBookId}', {\n`;
  for (const { prevId, newId, title } of pageMap) {
    entryBlock += `      /* ${title} */\n`;
    entryBlock += `      '${prevId}': '${newId}',\n`;
  }
  entryBlock += `    }],\n`;
  entryBlock += `  ],\n`;

  const outputPath = path.resolve(
    __dirname,
    `../src/canonicalBookMap/${previousBook.slug}.ts`
  );

  const fileExists = fs.existsSync(outputPath);

  if (fileExists) {
    const existing = readFile(outputPath);
    const closingMarker = /\n} as CanonicalBookMap;\s*$/;
    if (!closingMarker.test(existing)) {
      console.error(
        `Cannot append: ${outputPath} does not end with the expected ` +
        `'} as CanonicalBookMap;' marker. Edit it manually.`
      );
      process.exit(1);
    }
    const updated = existing.replace(
      closingMarker,
      `\n${entryBlock}\n} as CanonicalBookMap;\n`
    );
    writeFile(outputPath, updated);
    console.log(`Appended new entry to src/canonicalBookMap/${previousBook.slug}.ts`);
  } else {
    const fileContent =
      `import { CanonicalBookMap } from '../canonicalBookMap';\n\n` +
      `export default {\n` +
      entryBlock +
      `} as CanonicalBookMap;\n`;
    writeFile(outputPath, fileContent);
    console.log(`Created src/canonicalBookMap/${previousBook.slug}.ts`);
    console.log(
      `Make sure to import and spread the new map in src/canonicalBookMap.ts`
    );
  }
};

addNewEdition().catch((e) => {
  console.error('An error prevented the script from completing:', e);
  process.exit(1);
});
