export interface BookVersionConfig {
  defaultVersion: string;
  archiveOverride?: string;
}

interface Books {
  [key: string]: BookVersionConfig;
}

declare const books: Books;
export = books;
