import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { CANONICAL_MAP } from '../src/canonicalBookMap';
import pageMap from './ap-physics-pagemap-2.json';

(global as any).fetch = fetch;

const addPageMap = (file: any) => {
  const updatedCanonicalMap = { ...CANONICAL_MAP };
  const changedIds = file.filter((row: {[key: string]: string}) => row.FIELD2 !== row.FIELD3);
  let stringified = '';
  changedIds.forEach((row: {[key: string]: string}) => {
      stringified += `/* ${row.FIELD1} to the same module in 2e */\n'${row.FIELD2}': '${row.FIELD3}',\n`;
    });
  const mapFile = path.resolve(__dirname, '../src/canonicalBookMap/physicsAP.ts');
  fs.writeFileSync(mapFile, `{${stringified}}`, 'utf8');
};

addPageMap(pageMap);
