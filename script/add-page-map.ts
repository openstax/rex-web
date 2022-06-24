import fetch from 'node-fetch';
import path from 'path';
import argv from 'yargs';
import { CANONICAL_MAP } from '../src/canonicalBookMap';
import { readFile, writeFile } from '../src/helpers/fileUtils';

(global as any).fetch = fetch;

const addPageMap = () => {
  const {
    mapPath,
    bookSlug,
    bookTitle,
    bookId,
    canonicalBookTitle,
    canonicalBookId,
  } = argv.string('mapPath').argv as any as {
    mapPath: string,
    bookSlug: string,
    bookTitle: string,
    bookId: string,
    canonicalBookTitle: string,
    canonicalBookId: string,
  };

  if (!mapPath || !bookSlug || !bookId || !canonicalBookId) {
    console.log('Mapping failed. Missing one or more arguments.');
    process.exit(1);
  }

  // tslint:disable-next-line: max-line-length
  let mapString = `// tslint:disable: object-literal-sort-keys\n// tslint:disable: max-line-length\n\nimport { CanonicalBookMap } from '../canonicalBookMap';\n\nexport default {\n  /* ${bookTitle} */ '${bookId}': [\n    /* ${canonicalBookTitle} */ ['${canonicalBookId}', {\n`;

  const mapFile = readFile(mapPath);
  const parsedMap = JSON.parse(mapFile);
  const changedIds = parsedMap.filter((row: {[key: string]: string}) => row.moduleId !== row.canonicalId);

  changedIds.forEach((row: {[key: string]: string}) => {
    // tslint:disable-next-line: max-line-length
    mapString += `      /* ${row.module} to the same module in ${canonicalBookTitle} */\n      '${row.moduleId}': '${row.canonicalId}',\n`;
  });
  mapString += `    }],\n  ],\n} as CanonicalBookMap;\n`;
  const newMap = path.resolve(__dirname, `../src/canonicalBookMap/${bookSlug}.ts`);
  writeFile(newMap, mapString);
  console.log('Mapping complete. Make sure to import new map to canonicalBookMap.ts');
};

addPageMap();
