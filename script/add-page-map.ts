import fetch from 'node-fetch';
import path from 'path';
import argv from 'yargs';
import { CANONICAL_MAP } from '../src/canonicalBookMap';
import { readFile, writeFile } from '../src/helpers/fileUtils';

(global as any).fetch = fetch;

const addPageMap = () => {
  const args = argv.string('mapPath').argv as any as {
    mapPath: string,
    bookSlug: string,
    bookTitle: string,
    bookId: string,
    canonicalBookTitle: string,
    canonicalBookId: string,
  };

  // tslint:disable-next-line: max-line-length
  let mapString = `// tslint:disable: object-literal-sort-keys\n// tslint:disable: max-line-length\n\nimport { CanonicalBookMap } from '../canonicalBookMap';\n\nexport default {\n  /* ${args.bookTitle} */ '${args.bookId}': [\n    /* ${args.canonicalBookTitle} */ ['${args.canonicalBookId}', {\n`;

  const mapFile = readFile(args.mapPath);
  const parsedMap = JSON.parse(mapFile);
  const changedIds = parsedMap.filter((row: {[key: string]: string}) => row.moduleId !== row.canonicalId);

  changedIds.forEach((row: {[key: string]: string}) => {
    // tslint:disable-next-line: max-line-length
    mapString += `      /* ${row.module} to the same module in ${args.canonicalBookTitle} */\n      '${row.moduleId}': '${row.canonicalId}',\n`;
  });
  mapString += `    }],\n  ],\n} as CanonicalBookMap;\n`;
  const newMap = path.resolve(__dirname, `../src/canonicalBookMap/${args.bookSlug}.ts`);
  writeFile(newMap, mapString);
};

addPageMap();
