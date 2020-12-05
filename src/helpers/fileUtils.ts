import fs from 'fs';
import path from 'path';

const exists = (filepath: string) => {
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

export const directoryExists = (filepath: string) => exists(filepath) && fs.lstatSync(filepath).isDirectory();

export const touchFile = (filepath: string) => exists(filepath) || writeFile(filepath, '');
export const readFile = (filepath: string) => fs.readFileSync(filepath, 'utf8');
export const deleteFile = (filepath: string) => fs.unlinkSync(filepath);

export const makeDirectories = (filepath: string) => {
  const dirname = path.dirname(filepath);
  if (directoryExists(dirname)) {
    return true;
  }
  makeDirectories(dirname);
  fs.mkdirSync(dirname);
};

export const writeFile = (filepath: string, contents: string) => {
  makeDirectories(filepath);
  fs.writeFileSync(filepath, contents);
};
