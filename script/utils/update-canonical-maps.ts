import fs from 'fs';
import path from 'path';
import { BookWithOSWebData } from '../../src/app/content/types';
import { flattenArchiveTree, stripIdVersion } from '../../src/app/content/utils';
import {
  archiveTreeSectionIsPage,
  disableArchiveTreeCaching,
} from '../../src/app/content/utils/archiveTreeUtils';
disableArchiveTreeCaching();

const canonicalBookMapDir = path.resolve(__dirname, '../../src/canonicalBookMap');

const buildSlugBasedPageIdMap = (
  currentPages: ReadonlyArray<{id: string; slug: string}>,
  newPages: ReadonlyArray<{id: string; slug: string}>
): Record<string, string> => {
  const pageIdMap: Record<string, string> = {};
  for (const page of currentPages) {
    const matchingNewPage = newPages.find((p) => p.slug === page.slug);
    if (matchingNewPage) {
      const currentId = stripIdVersion(page.id);
      const newId = stripIdVersion(matchingNewPage.id);
      if (currentId !== newId) {
        pageIdMap[currentId] = newId;
      }
    }
  }
  return pageIdMap;
};

const formatCanonicalMapEntry = (
  currentBook: BookWithOSWebData,
  newBook: BookWithOSWebData,
  pageIdMap: Record<string, string>
): string => {
  let entry = `  /* ${currentBook.title} */ '${currentBook.id}': [\n`;
  entry += `    /* ${newBook.title} */['${newBook.id}', {\n`;
  for (const [currentPageId, newPageId] of Object.entries(pageIdMap)) {
    entry += `      '${currentPageId}': '${newPageId}',\n`;
  }
  entry += `    }],\n`;
  entry += `  ],\n`;
  return entry;
};

/*
 * Updates canonical book map files based on slug-matching between two book editions.
 * Pages with matching slugs but different IDs are recorded as canonical mappings.
 *
 * When an existing canonical map file already references newBook.id, the entry for
 * currentBook is appended to that file. Otherwise a new file is created at
 * src/canonicalBookMap/<newBook.slug>.ts and must be manually imported in
 * src/canonicalBookMap.ts.
 */
const updateCanonicalMaps = (
  currentBook: BookWithOSWebData,
  newBook: BookWithOSWebData
) => {
  const currentPages = flattenArchiveTree(currentBook.tree)
    .filter((section) => section.id !== currentBook.id)
    .filter(archiveTreeSectionIsPage);

  const newPages = flattenArchiveTree(newBook.tree)
    .filter((section) => section.id !== newBook.id)
    .filter(archiveTreeSectionIsPage);

  const pageIdMap = buildSlugBasedPageIdMap(currentPages, newPages);

  // Search for an existing canonical map file that already references newBook.id
  let targetFilePath: string | undefined;
  const files = fs.readdirSync(canonicalBookMapDir).filter((f) => f.endsWith('.ts'));

  for (const file of files) {
    const fullPath = path.join(canonicalBookMapDir, file);
    if (fs.readFileSync(fullPath, 'utf8').includes(newBook.id)) {
      targetFilePath = fullPath;
      break;
    }
  }

  if (targetFilePath) {
    const existingContent = fs.readFileSync(targetFilePath, 'utf8');

    if (existingContent.includes(currentBook.id)) {
      console.log(`Canonical map entry for book ${currentBook.id} already exists. Skipping.`);
      return;
    }

    const closingMarker = '} as CanonicalBookMap;';
    const insertPos = existingContent.lastIndexOf(closingMarker);
    if (insertPos === -1) {
      console.error(`Could not find closing marker in ${targetFilePath}. Canonical map not updated.`);
      return;
    }

    const updatedContent =
      existingContent.slice(0, insertPos)
      + formatCanonicalMapEntry(currentBook, newBook, pageIdMap)
      + existingContent.slice(insertPos);
    fs.writeFileSync(targetFilePath, updatedContent, 'utf8');
    console.log(`Updated canonical book map: src/canonicalBookMap/${path.basename(targetFilePath)}`);
  } else {
    const newFilePath = path.join(canonicalBookMapDir, `${newBook.slug}.ts`);
    const fileContent =
      `import { CanonicalBookMap } from '../canonicalBookMap';\n\nexport default {\n`
      + formatCanonicalMapEntry(currentBook, newBook, pageIdMap)
      + `} as CanonicalBookMap;\n`;

    fs.writeFileSync(newFilePath, fileContent, 'utf8');
    console.log(`Created new canonical book map: src/canonicalBookMap/${newBook.slug}.ts`);
    console.log(`Make sure to import it in src/canonicalBookMap.ts`);
  }
};

export default updateCanonicalMaps;
