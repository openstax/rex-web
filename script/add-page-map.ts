import fetch from 'node-fetch';
import path from 'path';
import argv from 'yargs';
import { readFile, writeFile } from '../src/helpers/fileUtils';

(global as any).fetch = fetch;

const addPageMap = () => {
  const args = argv.string('mapPath').argv as any as {
    mapPath: string,
    bookSlug: string,
  };

  const mapFile = readFile(args.mapPath);
  const parsedMap = JSON.parse(mapFile);

  const changedIds = parsedMap.filter((row: {[key: string]: string}) => row.moduleId !== row.canonicalId);
  let mapString = '';
  changedIds.forEach((row: {[key: string]: string}) => {
    mapString += `/* ${row.module} to the same module */\n'${row.moduleId}': '${row.canonicalId}',\n`;
    });
  const newMap = path.resolve(__dirname, `../src/canonicalBookMap/${args.bookSlug}.ts`);
  writeFile(newMap, mapString);
};

addPageMap();
